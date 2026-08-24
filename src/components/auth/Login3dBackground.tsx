import { useEffect, useRef } from "react";

interface Node3D {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  radius: number;
  color: string;
}

export function Login3dBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const setSize = () => {
      if (!canvas) return;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };
    setSize();

    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = (e.clientX - width / 2) * 0.35;
      targetMouseY = (e.clientY - height / 2) * 0.35;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        targetMouseX = (e.touches[0].clientX - width / 2) * 0.25;
        targetMouseY = (e.touches[0].clientY - height / 2) * 0.25;
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("resize", setSize, { passive: true });

    // 3D particles with emerald, mint, amber tones
    const nodeCount = window.innerWidth < 768 ? 28 : 48;
    const nodes: Node3D[] = [];
    const colors = [
      "rgba(16, 185, 129, ",   // Emerald
      "rgba(5, 150, 105, ",    // Forest emerald
      "rgba(245, 158, 11, ",   // Amber
      "rgba(217, 119, 6, ",    // Warm Amber
    ];

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: (Math.random() - 0.5) * width * 1.2,
        y: (Math.random() - 0.5) * height * 1.2,
        z: Math.random() * 600 - 300,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        vz: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 2.0 + 1.0,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    const fov = 350;

    const render = () => {
      mouseX += (targetMouseX - mouseX) * 0.04;
      mouseY += (targetMouseY - mouseY) * 0.04;

      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      const projectedNodes: { x: number; y: number; scale: number; node: Node3D }[] = [];

      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];

        node.x += node.vx;
        node.y += node.vy;
        node.z += node.vz;

        if (node.x < -width * 0.7) node.x = width * 0.7;
        if (node.x > width * 0.7) node.x = -width * 0.7;
        if (node.y < -height * 0.7) node.y = height * 0.7;
        if (node.y > height * 0.7) node.y = -height * 0.7;
        if (node.z < -300) node.z = 300;
        if (node.z > 300) node.z = -300;

        const rotX = (mouseY / height) * 0.35;
        const rotY = (mouseX / width) * 0.35;

        const cosY = Math.cos(rotY);
        const sinY = Math.sin(rotY);
        const cosX = Math.cos(rotX);
        const sinX = Math.sin(rotX);

        const x1 = node.x * cosY - node.z * sinY;
        const z1 = node.z * cosY + node.x * sinY;

        const y2 = node.y * cosX - z1 * sinX;
        const z2 = z1 * cosX + node.y * sinX + 500;

        if (z2 > 10) {
          const scale = fov / z2;
          const projX = centerX + x1 * scale;
          const projY = centerY + y2 * scale;
          projectedNodes.push({ x: projX, y: projY, scale, node });
        }
      }

      // Connecting 3D geometric network lines
      for (let i = 0; i < projectedNodes.length; i++) {
        for (let j = i + 1; j < projectedNodes.length; j++) {
          const p1 = projectedNodes[i];
          const p2 = projectedNodes[j];

          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          const maxDist = 120;
          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.18 * Math.min(p1.scale, p2.scale);
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(16, 185, 129, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Glowing 3D nodes
      for (let i = 0; i < projectedNodes.length; i++) {
        const { x, y, scale, node } = projectedNodes[i];
        const r = Math.max(node.radius * scale * 1.4, 0.7);
        const alpha = Math.min(Math.max((scale - 0.2) * 1.0, 0.12), 0.75);

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, r * 2.8);
        gradient.addColorStop(0, `${node.color}${alpha})`);
        gradient.addColorStop(0.6, `${node.color}${alpha * 0.3})`);
        gradient.addColorStop(1, `${node.color}0)`);

        ctx.beginPath();
        ctx.arc(x, y, r * 2.8, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = `${node.color}${Math.min(alpha * 1.3, 0.9)})`;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("resize", setSize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden"
    />
  );
}
