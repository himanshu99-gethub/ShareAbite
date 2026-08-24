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

export function Hero3dBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // DPR Scaling for crisp retina displays
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

    // Mouse tracking with smooth spring damping
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = (e.clientX - width / 2) * 0.4;
      targetMouseY = (e.clientY - height / 2) * 0.4;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        targetMouseX = (e.touches[0].clientX - width / 2) * 0.3;
        targetMouseY = (e.touches[0].clientY - height / 2) * 0.3;
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("resize", setSize, { passive: true });

    // Initialize 3D nodes (emerald, amber, and glowing white particles)
    const nodeCount = window.innerWidth < 768 ? 32 : 55;
    const nodes: Node3D[] = [];
    const colors = [
      "rgba(16, 185, 129, ",   // Emerald
      "rgba(52, 211, 153, ",   // Light emerald
      "rgba(251, 191, 36, ",   // Amber
      "rgba(245, 158, 11, ",   // Warm amber
      "rgba(255, 255, 255, ",  // Glow white
    ];

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: (Math.random() - 0.5) * width * 1.4,
        y: (Math.random() - 0.5) * height * 1.4,
        z: Math.random() * 800 - 400,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        vz: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 2.2 + 1.2,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    const fov = 400; // Field of view for 3D perspective

    // Render loop
    const render = () => {
      // Smooth interpolation for mouse parallax
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      // Update and project 3D nodes
      const projectedNodes: { x: number; y: number; scale: number; node: Node3D }[] = [];

      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];

        // Move nodes
        node.x += node.vx;
        node.y += node.vy;
        node.z += node.vz;

        // Wrap around boundaries
        if (node.x < -width * 0.8) node.x = width * 0.8;
        if (node.x > width * 0.8) node.x = -width * 0.8;
        if (node.y < -height * 0.8) node.y = height * 0.8;
        if (node.y > height * 0.8) node.y = -height * 0.8;
        if (node.z < -400) node.z = 400;
        if (node.z > 400) node.z = -400;

        // Apply mouse rotation / parallax tilt in 3D
        const rotX = (mouseY / height) * 0.4;
        const rotY = (mouseX / width) * 0.4;

        // 3D rotation math
        const cosY = Math.cos(rotY);
        const sinY = Math.sin(rotY);
        const cosX = Math.cos(rotX);
        const sinX = Math.sin(rotX);

        // Y-axis rotation
        const x1 = node.x * cosY - node.z * sinY;
        const z1 = node.z * cosY + node.x * sinY;

        // X-axis rotation
        const y2 = node.y * cosX - z1 * sinX;
        const z2 = z1 * cosX + node.y * sinX + 600; // Camera distance

        if (z2 > 10) {
          const scale = fov / z2;
          const projX = centerX + x1 * scale;
          const projY = centerY + y2 * scale;

          projectedNodes.push({ x: projX, y: projY, scale, node });
        }
      }

      // Draw subtle connecting 3D neural lines between nearby nodes
      for (let i = 0; i < projectedNodes.length; i++) {
        for (let j = i + 1; j < projectedNodes.length; j++) {
          const p1 = projectedNodes[i];
          const p2 = projectedNodes[j];

          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          const maxDist = 130;
          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.22 * Math.min(p1.scale, p2.scale);
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(52, 211, 153, ${alpha})`;
            ctx.lineWidth = 0.9;
            ctx.stroke();
          }
        }
      }

      // Draw glowing 3D nodes
      for (let i = 0; i < projectedNodes.length; i++) {
        const { x, y, scale, node } = projectedNodes[i];
        const r = Math.max(node.radius * scale * 1.5, 0.8);
        const alpha = Math.min(Math.max((scale - 0.2) * 1.2, 0.15), 0.85);

        // Outer glow
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, r * 3);
        gradient.addColorStop(0, `${node.color}${alpha})`);
        gradient.addColorStop(0.5, `${node.color}${alpha * 0.35})`);
        gradient.addColorStop(1, `${node.color}0)`);

        ctx.beginPath();
        ctx.arc(x, y, r * 3, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Solid core
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = `${node.color}${Math.min(alpha * 1.4, 1)})`;
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
      className="absolute inset-0 w-full h-full pointer-events-none z-[2] opacity-75 mix-blend-screen"
    />
  );
}
