import React, { useEffect, useRef } from 'react';

export const MinecraftBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Subtle floating ambient green / gold dust spores matching Minecraft Overworld
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    interface Spore {
      x: number;
      y: number;
      size: number;
      vx: number;
      vy: number;
      color: string;
      alpha: number;
    }

    const colors = ['#55C64B', '#4ee2ec', '#3fa337'];
    const count = 18; // minimal, non-distracting
    const spores: Spore[] = [];

    for (let i = 0; i < count; i++) {
      spores.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() > 0.5 ? 3 : 2, // integer pixel size
        vx: (Math.random() - 0.5) * 0.3,
        vy: -Math.random() * 0.4 - 0.1,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.35 + 0.15,
      });
    }

    let t = 0;
    let running = true;
    const render = () => {
      if (!running) return;
      t += 0.01;
      ctx.clearRect(0, 0, width, height);

      spores.forEach((s) => {
        s.x += s.vx + Math.sin(t + s.y * 0.01) * 0.15;
        s.y += s.vy;

        if (s.y < -10) s.y = height + 10;
        if (s.x < -10) s.x = width + 10;
        if (s.x > width + 10) s.x = -10;

        ctx.fillStyle = s.color;
        ctx.globalAlpha = s.alpha;
        // Strict integer grid alignment for authentic pixel look
        ctx.fillRect(Math.floor(s.x), Math.floor(s.y), s.size, s.size);
      });

      ctx.globalAlpha = 1.0;
      animId = requestAnimationFrame(render);
    };

    // ponytail: pause rAF when tab hidden; full observer if canvas scrolls offscreen often
    const handleVisibility = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(animId);
      } else if (!running) {
        running = true;
        render();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    render();

    return () => {
      running = false;
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibility);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 w-full h-full pointer-events-none -z-50 select-none overflow-hidden"
    >
      {/* Dark Minecraft stone / bedrock base */}
      <div className="absolute inset-0 bg-[#0e100f]" />

      {/* Rough Minecraft pixelated stone texture overlay */}
      <div className="absolute inset-0 mc-rough-stone-texture opacity-25" />

      {/* Subtle pixel grid lines */}
      <div className="absolute inset-0 mc-pixel-grid opacity-35" />

      {/* Atmospheric vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 50% 30%, rgba(18, 24, 18, 0.4) 0%, rgba(10, 12, 10, 0.92) 80%)',
        }}
      />

      {/* Minimalist floating spores canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
};
