'use client';
import { useEffect, useRef } from 'react';

export default function Stars() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf: number;
    let isVisible = true;

    const setSize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);

      stars.forEach(s => {
        if (s.x > window.innerWidth) s.x = Math.random() * window.innerWidth;
        if (s.y > window.innerHeight) s.y = Math.random() * window.innerHeight;
      });
    };

    const stars = Array.from({ length: 180 }, () => ({
      x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
      y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
      r: Math.random() * 1.1 + 0.2,
      baseA: Math.random() * 0.5 + 0.08,
      speed: Math.random() * 0.03 + 0.005,
      phase: Math.random() * Math.PI * 2,
    }));

    setSize();
    window.addEventListener('resize', setSize);

    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
      if (isVisible) {
        raf = requestAnimationFrame(draw);
      } else {
        cancelAnimationFrame(raf);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    let t = 0;
    const draw = () => {
      if (!isVisible) return;
      t += 0.005;
      const width = window.innerWidth;
      const height = window.innerHeight;

      ctx.clearRect(0, 0, width, height);

      /* soft nebula orbs */
      const addOrb = (cx: number, cy: number, r: number, c: string) => {
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        g.addColorStop(0, c);
        g.addColorStop(1, 'transparent');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
      };
      addOrb(width * 0.72, height * 0.22, width * 0.38, 'rgba(70,90,170,0.055)');
      addOrb(width * 0.18, height * 0.78, width * 0.28, 'rgba(50,70,140,0.04)');
      addOrb(width * 0.5, height * 0.5, width * 0.5, 'rgba(30,35,60,0.03)');

      /* stars */
      stars.forEach(s => {
        const a = s.baseA * (0.5 + 0.5 * Math.sin(t * 40 * s.speed + s.phase));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(210,220,255,${a})`;
        ctx.fill();
        s.y -= s.speed * 0.08;
        if (s.y < -2) {
          s.y = height + 2;
          s.x = Math.random() * width;
        }
      });

      raf = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', setSize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.9 }} />;
}
