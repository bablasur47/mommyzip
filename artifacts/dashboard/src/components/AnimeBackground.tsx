import { useEffect, useRef } from "react";

interface Petal {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  sway: number;
  swaySpeed: number;
  swayOffset: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
}

interface Star {
  x: number;
  y: number;
  radius: number;
  twinkleSpeed: number;
  twinkleOffset: number;
}

export function AnimeBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animFrameId: number;
    let t = 0;
    const petals: Petal[] = [];
    const stars: Star[] = [];

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function createPetal(): Petal {
      return {
        x: Math.random() * (canvas?.width ?? 1200),
        y: -20,
        size: 3 + Math.random() * 5,
        speedY: 0.4 + Math.random() * 0.9,
        speedX: -0.3 + Math.random() * 0.6,
        sway: 25 + Math.random() * 40,
        swaySpeed: 0.005 + Math.random() * 0.008,
        swayOffset: Math.random() * Math.PI * 2,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.04,
        opacity: 0.25 + Math.random() * 0.4,
      };
    }

    function initStars() {
      const w = canvas?.width ?? 1200;
      const h = canvas?.height ?? 800;
      for (let i = 0; i < 120; i++) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h * 0.7,
          radius: 0.4 + Math.random() * 1.2,
          twinkleSpeed: 0.008 + Math.random() * 0.015,
          twinkleOffset: Math.random() * Math.PI * 2,
        });
      }
    }

    function drawPetal(p: Petal) {
      ctx!.save();
      ctx!.translate(p.x, p.y);
      ctx!.rotate(p.rotation);
      ctx!.globalAlpha = p.opacity;

      const g = ctx!.createRadialGradient(0, 0, 0, 0, 0, p.size);
      g.addColorStop(0, "rgba(200, 160, 180, 0.9)");
      g.addColorStop(1, "rgba(160, 120, 150, 0)");
      ctx!.fillStyle = g;

      ctx!.beginPath();
      ctx!.moveTo(0, -p.size);
      ctx!.bezierCurveTo(p.size * 0.9, -p.size * 0.4, p.size * 0.9, p.size * 0.4, 0, p.size * 0.9);
      ctx!.bezierCurveTo(-p.size * 0.9, p.size * 0.4, -p.size * 0.9, -p.size * 0.4, 0, -p.size);
      ctx!.closePath();
      ctx!.fill();

      ctx!.restore();
    }

    function drawStar(s: Star, time: number) {
      const brightness = 0.35 + 0.35 * Math.sin(time * s.twinkleSpeed + s.twinkleOffset);
      ctx!.save();
      ctx!.globalAlpha = brightness;
      ctx!.fillStyle = "#c8d0e0";
      ctx!.beginPath();
      ctx!.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      ctx!.fill();
      ctx!.restore();
    }

    function drawMoon() {
      const w = canvas?.width ?? 1200;
      const mx = w * 0.82;
      const my = 90;
      const r = 38;

      ctx!.save();
      const g = ctx!.createRadialGradient(mx, my, r * 0.3, mx, my, r * 2.5);
      g.addColorStop(0, "rgba(180, 195, 220, 0.12)");
      g.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx!.fillStyle = g;
      ctx!.beginPath();
      ctx!.arc(mx, my, r * 2.5, 0, Math.PI * 2);
      ctx!.fill();

      const mg = ctx!.createRadialGradient(mx - 6, my - 4, r * 0.1, mx, my, r);
      mg.addColorStop(0, "rgba(230, 235, 245, 0.9)");
      mg.addColorStop(0.6, "rgba(200, 210, 230, 0.7)");
      mg.addColorStop(1, "rgba(160, 175, 200, 0.5)");
      ctx!.fillStyle = mg;
      ctx!.beginPath();
      ctx!.arc(mx, my, r, 0, Math.PI * 2);
      ctx!.fill();

      ctx!.globalAlpha = 0.08;
      ctx!.strokeStyle = "rgba(200, 210, 240, 0.5)";
      ctx!.lineWidth = 1;
      for (let i = 1; i <= 3; i++) {
        ctx!.beginPath();
        ctx!.arc(mx, my, r + i * 10, 0, Math.PI * 2);
        ctx!.stroke();
      }

      ctx!.restore();
    }

    function animate() {
      if (!canvas || !ctx) return;
      t++;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      grad.addColorStop(0, "hsl(220, 30%, 4%)");
      grad.addColorStop(0.5, "hsl(222, 25%, 5%)");
      grad.addColorStop(1, "hsl(218, 20%, 6%)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (const s of stars) drawStar(s, t);
      drawMoon();

      if (petals.length < 55 && Math.random() < 0.04) {
        petals.push(createPetal());
      }

      for (let i = petals.length - 1; i >= 0; i--) {
        const p = petals[i];
        p.y += p.speedY;
        p.x += p.speedX + p.sway * Math.sin(p.y * p.swaySpeed + p.swayOffset) * 0.01;
        p.rotation += p.rotationSpeed;
        if (p.y > canvas.height + 20) {
          petals.splice(i, 1);
        } else {
          drawPetal(p);
        }
      }

      animFrameId = requestAnimationFrame(animate);
    }

    resize();
    initStars();
    window.addEventListener("resize", resize);
    animate();

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
    />
  );
}
