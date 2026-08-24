import { useEffect, useRef } from "react";

interface Particle3D {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  size: number;
  color: string;
  alpha: number;
  pulseSpeed: number;
  pulseOffset: number;
}

export function Interactive3DCanvas({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0, isHovered: false });
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let particles: Particle3D[] = [];
    const PARTICLE_COUNT = 45;
    const colors = ["#10b981", "#34d399", "#f59e0b", "#6ee7b7", "#3b82f6"];

    function resize() {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx?.scale(dpr, dpr);
    }

    function initParticles() {
      particles = [];
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
          x: (Math.random() - 0.5) * (width || 800),
          y: (Math.random() - 0.5) * (height || 600),
          z: Math.random() * 600 + 100, // Depth from 100 to 700
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          vz: (Math.random() - 0.5) * 0.2,
          size: Math.random() * 3 + 2,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: Math.random() * 0.5 + 0.3,
          pulseSpeed: Math.random() * 0.03 + 0.01,
          pulseOffset: Math.random() * Math.PI * 2,
        });
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      mouseRef.current.targetX = nx * 80;
      mouseRef.current.targetY = ny * 80;
      mouseRef.current.isHovered = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.targetX = 0;
      mouseRef.current.targetY = 0;
      mouseRef.current.isHovered = false;
    };

    window.addEventListener("resize", () => {
      resize();
      initParticles();
    });

    const parent = canvas.parentElement;
    if (parent) {
      parent.addEventListener("mousemove", handleMouseMove);
      parent.addEventListener("mouseleave", handleMouseLeave);
    }

    resize();
    initParticles();

    let time = 0;
    const fov = 400; // 3D Field of view

    function render() {
      if (!ctx || !canvas) return;
      time += 0.015;

      // Smooth mouse lerp
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.06;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.06;

      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      // Update and project 3D points to 2D
      const projected: { x: number; y: number; z: number; size: number; alpha: number; color: string }[] = [];

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;

        // Wrap around bounds
        const boundX = width / 1.5;
        const boundY = height / 1.5;
        if (p.x < -boundX) p.x = boundX;
        if (p.x > boundX) p.x = -boundX;
        if (p.y < -boundY) p.y = boundY;
        if (p.y > boundY) p.y = -boundY;
        if (p.z < 80) p.z = 700;
        if (p.z > 700) p.z = 80;

        // Apply mouse tilt offset
        const transformedX = p.x - mouseRef.current.x * (p.z / 300);
        const transformedY = p.y - mouseRef.current.y * (p.z / 300);

        // 3D Perspective Projection
        const scale = fov / (fov + p.z);
        const screenX = centerX + transformedX * scale;
        const screenY = centerY + transformedY * scale;
        const radius = Math.max(1, p.size * scale);
        const dynamicAlpha = Math.max(0.1, (Math.sin(time * 2 + p.pulseOffset) * 0.2 + p.alpha) * scale * 1.2);

        projected.push({
          x: screenX,
          y: screenY,
          z: p.z,
          size: radius,
          alpha: dynamicAlpha,
          color: p.color,
        });
      }

      // Draw constellation connections between nearby projected points
      ctx.lineWidth = 0.75;
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const p1 = projected[i];
          const p2 = projected[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 110) {
            const lineAlpha = (1 - dist / 110) * 0.18 * Math.min(p1.alpha, p2.alpha);
            ctx.strokeStyle = `rgba(52, 211, 153, ${lineAlpha})`;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      // Draw 3D nodes with glow
      for (let i = 0; i < projected.length; i++) {
        const p = projected[i];
        ctx.save();
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8 * p.size;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(render);
    }

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (parent) {
        parent.removeEventListener("mousemove", handleMouseMove);
        parent.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      style={{ opacity: 0.85 }}
    />
  );
}
