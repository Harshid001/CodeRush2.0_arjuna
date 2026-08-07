'use client';
import { useEffect, useRef } from 'react';

export default function Stars() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    let raf: number;

    const setSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setSize();
    window.addEventListener('resize', setSize);

    const stars = Array.from({ length: 220 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.1 + 0.2,
      baseA: Math.random() * 0.5 + 0.08,
      speed: Math.random() * 0.03 + 0.005,
      phase: Math.random() * Math.PI * 2,
    }));

    let t = 0;
    const draw = () => {
      t += 0.005;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

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
      addOrb(canvas.width * 0.72, canvas.height * 0.22, canvas.width * 0.38, 'rgba(70,90,170,0.055)');
      addOrb(canvas.width * 0.18, canvas.height * 0.78, canvas.width * 0.28, 'rgba(50,70,140,0.04)');
      addOrb(canvas.width * 0.5,  canvas.height * 0.5,  canvas.width * 0.5,  'rgba(30,35,60,0.03)');

      /* stars */
      stars.forEach(s => {
        const a = s.baseA * (0.5 + 0.5 * Math.sin(t * 40 * s.speed + s.phase));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(210,220,255,${a})`;
        ctx.fill();
        s.y -= s.speed * 0.08;
        if (s.y < -2) { s.y = canvas.height + 2; s.x = Math.random() * canvas.width; }
      });

      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', setSize); };
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.9 }} />;
}
