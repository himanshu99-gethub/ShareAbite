import { useEffect, useRef } from "react";

interface Node3D {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  radius: number;
  baseColor: string;
  glowColor: string;
}

interface Pulse {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  progress: number;
  speed: number;
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

    // Retina DPR scaling
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const setSize = () => {
      if (!canvas) return;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };
    setSize();

    // Mouse Tracking with smooth spring damping
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = (e.clientX - width / 2) * 0.45;
      targetMouseY = (e.clientY - height / 2) * 0.35;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        targetMouseX = (e.touches[0].clientX - width / 2) * 0.3;
        targetMouseY = (e.touches[0].clientY - height / 2) * 0.25;
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("resize", setSize, { passive: true });

    // ── 1. Floating 3D Network Nodes ──
    const isMobile = window.innerWidth < 768;
    const nodeCount = isMobile ? 18 : 32;
    const nodes: Node3D[] = [];

    const colorPalettes = [
      { base: "rgba(52, 211, 153, 0.95)", glow: "rgba(16, 185, 129, 0.35)" }, // Emerald
      { base: "rgba(110, 231, 183, 0.95)", glow: "rgba(52, 211, 153, 0.3)" }, // Mint
      { base: "rgba(251, 191, 36, 0.95)", glow: "rgba(245, 158, 11, 0.3)" },  // Amber
      { base: "rgba(255, 255, 255, 0.95)", glow: "rgba(255, 255, 255, 0.35)" }, // White Glow
    ];

    for (let i = 0; i < nodeCount; i++) {
      const palette = colorPalettes[Math.floor(Math.random() * colorPalettes.length)];
      nodes.push({
        x: (Math.random() - 0.5) * width * 1.4,
        y: (Math.random() - 0.5) * height * 1.3 - 30,
        z: Math.random() * 700 - 300,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        vz: (Math.random() - 0.5) * 0.35,
        radius: Math.random() * 2.2 + 1.2,
        baseColor: palette.base,
        glowColor: palette.glow,
      });
    }

    // ── 2. Traveling Energy Pulses ──
    const pulses: Pulse[] = [];

    // ── 3. 3D Wave Terrain Grid (Undulating Ground Field) ──
    const cols = isMobile ? 12 : 22;
    const rows = isMobile ? 8 : 12;
    const gridSpacing = isMobile ? 50 : 65;

    let time = 0;
    let lastFrameTime = 0;
    let isVisible = true;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fov = 400; // Camera Field of View
    const cameraZ = 600;

    const render = () => {
      const now = performance.now();
      if (!prefersReducedMotion && now - lastFrameTime < 33) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }
      lastFrameTime = now;
      time += 0.015;

      // Spring interpolation for smooth camera tilt
      mouseX += (targetMouseX - mouseX) * 0.045;
      mouseY += (targetMouseY - mouseY) * 0.045;

      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      // Smooth camera Euler angles
      const rotX = (mouseY / height) * 0.32 + Math.sin(time * 0.35) * 0.025;
      const rotY = (mouseX / width) * 0.38 + Math.cos(time * 0.3) * 0.025;

      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);

      // 3D perspective projection
      const project = (x: number, y: number, z: number) => {
        const x1 = x * cosY - z * sinY;
        const z1 = z * cosY + x * sinY;

        const y2 = y * cosX - z1 * sinX;
        const z2 = z1 * cosX + y * sinX + cameraZ;

        if (z2 <= 20) return null;

        const scale = fov / z2;
        return {
          x: centerX + x1 * scale,
          y: centerY + y2 * scale,
          scale,
          depth: z2,
        };
      };

      // ── PART A: 3D Wave Terrain Ground Plane ──
      const terrainPoints: ({ x: number; y: number; scale: number } | null)[][] = [];

      for (let r = 0; r < rows; r++) {
        terrainPoints[r] = [];
        const zPos = (r - rows / 2) * gridSpacing + 120;

        for (let c = 0; c < cols; c++) {
          const xPos = (c - cols / 2) * gridSpacing;

          const waveHeight =
            Math.sin(xPos * 0.006 + time * 1.5) * 32 +
            Math.cos(zPos * 0.007 + time * 1.2) * 25 +
            Math.sin((xPos + zPos) * 0.005 + time * 0.8) * 18;

          const yPos = 130 + waveHeight;
          terrainPoints[r][c] = project(xPos, yPos, zPos);
        }
      }

      // Draw wireframe grid
      ctx.lineWidth = 0.75;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const p1 = terrainPoints[r][c];
          if (!p1) continue;

          // Connect horizontal
          if (c < cols - 1) {
            const p2 = terrainPoints[r][c + 1];
            if (p2) {
              const alpha = Math.min(Math.max((p1.scale - 0.25) * 0.32, 0.03), 0.22);
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.strokeStyle = `rgba(16, 185, 129, ${alpha})`;
              ctx.stroke();
            }
          }

          // Connect vertical
          if (r < rows - 1) {
            const p3 = terrainPoints[r + 1][c];
            if (p3) {
              const alpha = Math.min(Math.max((p1.scale - 0.25) * 0.32, 0.03), 0.22);
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p3.x, p3.y);
              ctx.strokeStyle = `rgba(5, 150, 105, ${alpha})`;
              ctx.stroke();
            }
          }
        }
      }

      // ── PART B: 3D Rotating Golden Orbital Ring ──
      const ringRadius = isMobile ? 110 : 170;
      const ringSegments = 32;
      const ringCenter = { x: 0, y: -20, z: 100 };

      ctx.lineWidth = 1.0;
      let prevRingPoint: { x: number; y: number } | null = null;
      let firstRingPoint: { x: number; y: number } | null = null;

      for (let i = 0; i <= ringSegments; i++) {
        const angle = (i / ringSegments) * Math.PI * 2 + time * 0.3;
        const rx = ringCenter.x + Math.cos(angle) * ringRadius;
        const ry = ringCenter.y + Math.sin(angle) * ringRadius * 0.4;
        const rz = ringCenter.z + Math.sin(angle) * ringRadius * 0.8;

        const proj = project(rx, ry, rz);
        if (proj) {
          if (!firstRingPoint) firstRingPoint = proj;
          if (prevRingPoint) {
            const alpha = Math.min(Math.max(proj.scale * 0.28, 0.06), 0.35);
            ctx.beginPath();
            ctx.moveTo(prevRingPoint.x, prevRingPoint.y);
            ctx.lineTo(proj.x, proj.y);
            ctx.strokeStyle = `rgba(251, 191, 36, ${alpha})`;
            ctx.stroke();
          }
          prevRingPoint = proj;
        }
      }
      if (prevRingPoint && firstRingPoint) {
        ctx.beginPath();
        ctx.moveTo(prevRingPoint.x, prevRingPoint.y);
        ctx.lineTo(firstRingPoint.x, firstRingPoint.y);
        ctx.strokeStyle = `rgba(251, 191, 36, 0.2)`;
        ctx.stroke();
      }

      // ── PART C: Floating 3D Constellation Nodes ──
      const projectedNodes: { x: number; y: number; scale: number; node: Node3D }[] = [];

      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];

        node.x += node.vx;
        node.y += node.vy;
        node.z += node.vz;

        if (node.x < -width * 0.75) node.x = width * 0.75;
        if (node.x > width * 0.75) node.x = -width * 0.75;
        if (node.y < -height * 0.7) node.y = height * 0.7;
        if (node.y > height * 0.7) node.y = -height * 0.7;
        if (node.z < -300) node.z = 400;
        if (node.z > 400) node.z = -300;

        const proj = project(node.x, node.y, node.z);
        if (proj) {
          projectedNodes.push({ x: proj.x, y: proj.y, scale: proj.scale, node });
        }
      }

      // Constellation lines
      const maxDist = isMobile ? 110 : 150;
      for (let i = 0; i < projectedNodes.length; i++) {
        for (let j = i + 1; j < projectedNodes.length; j++) {
          const p1 = projectedNodes[i];
          const p2 = projectedNodes[j];

          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.24 * Math.min(p1.scale, p2.scale);
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(52, 211, 153, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();

            // Spawn pulses
            if (Math.random() < 0.0018 && pulses.length < 10) {
              pulses.push({
                fromX: p1.x,
                fromY: p1.y,
                toX: p2.x,
                toY: p2.y,
                progress: 0,
                speed: 0.025 + Math.random() * 0.02,
              });
            }
          }
        }
      }

      // Active pulses
      for (let i = pulses.length - 1; i >= 0; i--) {
        const pulse = pulses[i];
        pulse.progress += pulse.speed;

        if (pulse.progress >= 1) {
          pulses.splice(i, 1);
          continue;
        }

        const curX = pulse.fromX + (pulse.toX - pulse.fromX) * pulse.progress;
        const curY = pulse.fromY + (pulse.toY - pulse.fromY) * pulse.progress;

        ctx.beginPath();
        ctx.arc(curX, curY, 2.2, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(251, 191, 36, 0.95)";
        ctx.shadowColor = "rgba(251, 191, 36, 0.85)";
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Draw Glowing 3D Nodes
      for (let i = 0; i < projectedNodes.length; i++) {
        const { x, y, scale, node } = projectedNodes[i];
        const r = Math.max(node.radius * scale * 1.35, 0.8);
        const alpha = Math.min(Math.max((scale - 0.2) * 1.25, 0.2), 0.95);

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, r * 3.5);
        gradient.addColorStop(0, node.glowColor);
        gradient.addColorStop(0.6, `${node.glowColor.slice(0, -4)}0.1)`);
        gradient.addColorStop(1, "rgba(0,0,0,0)");

        ctx.beginPath();
        ctx.arc(x, y, r * 3.5, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = node.baseColor;
        ctx.fill();
      }

      if (!prefersReducedMotion && isVisible && !document.hidden) {
        animationFrameId = requestAnimationFrame(render);
      } else {
        animationFrameId = 0;
      }
    };

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible && !prefersReducedMotion && !animationFrameId) {
          animationFrameId = requestAnimationFrame(render);
        }
      },
      { threshold: 0.01 },
    );
    visibilityObserver.observe(canvas);
    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("resize", setSize);
      visibilityObserver.disconnect();
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[#02150e]">
      {/* Dynamic atmospheric radial gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,rgba(16,185,129,0.28)_0%,transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_45%,rgba(245,158,11,0.14)_0%,transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_75%,rgba(5,150,105,0.18)_0%,transparent_55%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#02140d]/40 via-transparent to-[#010905]" />

      {/* 3D Hardware Accelerated Canvas */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="absolute inset-0 w-full h-full pointer-events-none z-[1] opacity-95"
      />
    </div>
  );
}
