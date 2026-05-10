import { useEffect, useRef } from "react";

export function NetworkCanvas({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let frame = 0;
    let animation = 0;
    const dots = Array.from({ length: 58 }, (_, index) => ({
      x: Math.random(),
      y: Math.random(),
      r: 1.2 + Math.random() * 2,
      vx: (Math.random() - 0.5) * 0.0008,
      vy: (Math.random() - 0.5) * 0.0008,
      hue: index % 7 === 0 ? "#f2b84b" : index % 5 === 0 ? "#a58bff" : "#4ad7ff",
    }));

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const scale = window.devicePixelRatio || 1;
      canvas.width = Math.floor(rect.width * scale);
      canvas.height = Math.floor(rect.height * scale);
      ctx.scale(scale, scale);
      ctx.clearRect(0, 0, rect.width, rect.height);
      ctx.fillStyle = "rgba(8, 10, 15, 0.2)";
      ctx.fillRect(0, 0, rect.width, rect.height);
      dots.forEach((dot) => {
        dot.x += dot.vx;
        dot.y += dot.vy;
        if (dot.x < 0 || dot.x > 1) dot.vx *= -1;
        if (dot.y < 0 || dot.y > 1) dot.vy *= -1;
      });
      for (let i = 0; i < dots.length; i += 1) {
        for (let j = i + 1; j < dots.length; j += 1) {
          const a = dots[i];
          const b = dots[j];
          const dx = (a.x - b.x) * rect.width;
          const dy = (a.y - b.y) * rect.height;
          const distance = Math.hypot(dx, dy);
          if (distance < 150) {
            ctx.strokeStyle = `rgba(74, 215, 255, ${0.12 - distance / 1600})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x * rect.width, a.y * rect.height);
            ctx.lineTo(b.x * rect.width, b.y * rect.height);
            ctx.stroke();
          }
        }
      }
      dots.forEach((dot, index) => {
        const pulse = Math.sin(frame / 40 + index) * 0.45 + 1.1;
        ctx.fillStyle = dot.hue;
        ctx.shadowColor = dot.hue;
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(dot.x * rect.width, dot.y * rect.height, dot.r * pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });
      frame += 1;
      animation = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animation);
  }, []);

  return <canvas ref={ref} className={className} />;
}
