import { logger } from "./logger";
import { getAiResponse } from "./ai-router";
import { getPersonality } from "./personality";

// ─── Style detection ──────────────────────────────────────────────────────────

const STYLE_KEYWORD_MAP: Array<[RegExp, string]> = [
  [/\b(anime|manga|waifu|chibi|kawaii|shounen|seinen|isekai)\b/i, "flux-anime"],
  [/\b(pixel\s*art|8[\s-]?bit|16[\s-]?bit|retro\s*game|sprite)\b/i, "flux-pixel"],
  [/\b(3d\s*render|blender|cgi|octane|cinema\s*4d|unreal\s*engine|3d\s*model)\b/i, "flux-3d"],
  [/\b(disney|pixar|dreamworks|cartoon|animated\s*movie|dreamworks)\b/i, "flux-disney"],
  [/\b(photo|photograph|realistic|hyperrealistic|portrait|cinematic|raw\s*photo|dslr|4k|8k)\b/i, "flux-realism"],
  [/\b(fast|quick|rough|sketch|draft)\b/i, "turbo"],
];

export type ImageStyle =
  | "auto"
  | "flux"
  | "flux-realism"
  | "flux-anime"
  | "flux-3d"
  | "flux-disney"
  | "flux-pixel"
  | "turbo";

export type ImageRatio = "square" | "portrait" | "landscape" | "wide";

const RATIO_DIMS: Record<ImageRatio, [number, number]> = {
  square:    [1024, 1024],
  portrait:  [768,  1344],
  landscape: [1344, 768],
  wide:      [1536, 640],
};

function detectStyle(prompt: string): ImageStyle {
  for (const [re, model] of STYLE_KEYWORD_MAP) {
    if (re.test(prompt)) return model as ImageStyle;
  }
  return "flux";
}

// ─── Prompt enhancement ───────────────────────────────────────────────────────

export async function enhancePrompt(rawPrompt: string): Promise<{ enhanced: string; wasEnhanced: boolean }> {
  try {
    const personality = await getPersonality();
    const enhanced = await getAiResponse(
      [
        {
          role: "system",
          content:
            "You are an expert image generation prompt engineer. Your job is to take a simple description and rewrite it as a rich, detailed image generation prompt. " +
            "Add specific details about: art style, lighting (e.g. golden hour, soft diffused, dramatic), composition (rule of thirds, close-up, wide shot), mood/atmosphere, color palette, and quality markers (masterpiece, highly detailed, 8K). " +
            "RULES: " +
            "- Keep output under 120 words " +
            "- Do NOT add any harmful, NSFW, or dangerous content unless the original prompt implies it " +
            "- Return ONLY the enhanced prompt text with no explanation, no prefix like 'Enhanced prompt:', nothing else",
        },
        {
          role: "user",
          content: `Enhance this image prompt: ${rawPrompt}`,
        },
      ],
      personality.activeProvider as "groq" | "gemini" | "nvidia"
    );

    const trimmed = enhanced.trim().replace(/^["']|["']$/g, "").trim();
    if (!trimmed || trimmed.length < 5) return { enhanced: rawPrompt, wasEnhanced: false };
    return { enhanced: trimmed.slice(0, 900), wasEnhanced: true };
  } catch {
    return { enhanced: rawPrompt, wasEnhanced: false };
  }
}

// ─── Providers ────────────────────────────────────────────────────────────────

async function tryPollinations(
  prompt: string,
  model: string,
  width: number,
  height: number,
  timeoutMs = 35_000
): Promise<Buffer> {
  const seed = Math.floor(Math.random() * 999_999);
  const url =
    `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}` +
    `?width=${width}&height=${height}&model=${model}&nologo=true&enhance=false&seed=${seed}`;

  const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
  if (!res.ok) throw new Error(`Pollinations/${model} → HTTP ${res.status}`);

  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 4_000) throw new Error(`Pollinations/${model} returned suspiciously small response`);
  return buf;
}

async function tryHuggingFace(prompt: string, width: number, height: number, timeoutMs = 40_000): Promise<Buffer> {
  const MODELS = [
    "black-forest-labs/FLUX.1-schnell",
    "stabilityai/stable-diffusion-xl-base-1.0",
    "alvdansen/littletinies",
  ];

  for (const model of MODELS) {
    try {
      const res = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inputs: prompt,
          parameters: { width: Math.min(width, 1024), height: Math.min(height, 1024) },
        }),
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (!res.ok) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 4_000) continue;
      logger.info({ model }, "HuggingFace image success");
      return buf;
    } catch {
      continue;
    }
  }
  throw new Error("All HuggingFace models failed");
}

// ─── Main entry ───────────────────────────────────────────────────────────────

export interface ImageResult {
  buffer: Buffer;
  provider: string;
  model: string;
  wasEnhanced: boolean;
  enhancedPrompt: string;
}

export async function generateImage(
  rawPrompt: string,
  style: ImageStyle = "auto",
  ratio: ImageRatio = "square"
): Promise<ImageResult> {
  const [width, height] = RATIO_DIMS[ratio];

  const { enhanced, wasEnhanced } = await enhancePrompt(rawPrompt);
  const finalPrompt = enhanced;

  const primaryModel: string = style === "auto" ? detectStyle(rawPrompt) : style;

  type Attempt = { label: string; fn: () => Promise<Buffer> };

  const attempts: Attempt[] = [];

  if (primaryModel !== "flux") {
    attempts.push({
      label: `pollinations/${primaryModel}`,
      fn: () => tryPollinations(finalPrompt, primaryModel, width, height),
    });
  }

  attempts.push(
    {
      label: "pollinations/flux",
      fn: () => tryPollinations(finalPrompt, "flux", width, height),
    },
    {
      label: "pollinations/turbo",
      fn: () => tryPollinations(finalPrompt, "turbo", width, height, 25_000),
    },
    {
      label: "huggingface",
      fn: () => tryHuggingFace(finalPrompt, width, height),
    },
    {
      label: "pollinations/flux-realism (fallback)",
      fn: () => tryPollinations(rawPrompt, "flux-realism", 1024, 1024, 45_000),
    }
  );

  const errors: string[] = [];
  for (const attempt of attempts) {
    try {
      logger.info({ provider: attempt.label, prompt: finalPrompt.slice(0, 60) }, "Trying image provider");
      const buffer = await attempt.fn();
      return {
        buffer,
        provider: attempt.label,
        model: primaryModel,
        wasEnhanced,
        enhancedPrompt: finalPrompt,
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`${attempt.label}: ${msg}`);
      logger.warn({ provider: attempt.label, err }, "Image provider failed, trying next");
    }
  }

  throw new Error(`All image providers failed:\n${errors.join("\n")}`);
}
