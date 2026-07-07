const API_BASE = "https://nekos.life/api/v2/img";

const GIF_ENDPOINTS: Record<string, string> = {
  hug: `${API_BASE}/hug`,
  slap: `${API_BASE}/slap`,
  kiss: `${API_BASE}/kiss`,
  pat:  `${API_BASE}/pat`,
  cuddle: `${API_BASE}/cuddle`,
  poke: `${API_BASE}/poke`,
  bite: `${API_BASE}/bite`,
  tickle: `${API_BASE}/tickle`,
  smug: `${API_BASE}/smug`,
};

const GIF_CACHE = new Map<string, string[]>();

async function fetchGif(action: string): Promise<string | null> {
  const endpoint = GIF_ENDPOINTS[action];
  if (!endpoint) return null;

  try {
    const res = await fetch(endpoint);
    if (!res.ok) return null;
    const data = (await res.json()) as { url: string };
    return data.url;
  } catch {
    return null;
  }
}

export async function getActionGif(action: string): Promise<string | null> {
  const cached = GIF_CACHE.get(action);
  if (cached && cached.length > 0) {
    const url = cached.shift()!;
    cached.push(url);
    return url;
  }

  const urls: string[] = [];
  for (let i = 0; i < 5; i++) {
    const url = await fetchGif(action);
    if (url) urls.push(url);
  }

  if (urls.length === 0) return null;
  GIF_CACHE.set(action, urls);
  const first = urls.shift()!;
  urls.push(first);
  return first;
}
