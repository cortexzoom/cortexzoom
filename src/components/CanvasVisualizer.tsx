import React, { useEffect, useRef, useState } from "react";
import { VisualizerParams } from "../types";

interface CanvasVisualizerProps {
  params: VisualizerParams;
  activeColors: string[];
  backgroundColor: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
  originalSize: number;
}

export default function CanvasVisualizer({
  params,
  activeColors,
  backgroundColor,
}: CanvasVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });
  const mouseRef = useRef({ x: -1000, y: -1000, active: false });
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const timeRef = useRef<number>(0);

  // Set up resize observer to keep canvas sized accurately
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      setDimensions({
        width: Math.max(width, 300),
        height: Math.max(height, 200),
      });
    });

    resizeObserver.observe(containerRef.current);
    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Initialize and maintain particles list based on params.particleCount
  useEffect(() => {
    const targetCount = params.particleCount;
    let current = particlesRef.current;

    if (current.length > targetCount) {
      // Shrink particle system
      particlesRef.current = current.slice(0, targetCount);
    } else if (current.length < targetCount) {
      // Grow particle system
      const diff = targetCount - current.length;
      const newParticles: Particle[] = [];
      const colors = activeColors.length > 0 ? activeColors : ["#00AEEF", "#6A00FF", "#DFFF7A"];

      for (let i = 0; i < diff; i++) {
        const size = Math.random() * 3 + 1;
        newParticles.push({
          x: Math.random() * dimensions.width,
          y: Math.random() * dimensions.height,
          vx: (Math.random() - 0.5) * params.particleSpeed,
          vy: (Math.random() - 0.5) * params.particleSpeed - 0.2, // slight upward drift by default
          size: size,
          originalSize: size,
          alpha: Math.random() * 0.6 + 0.2,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
      particlesRef.current = [...current, ...newParticles];
    }
  }, [params.particleCount, dimensions.width, dimensions.height, activeColors, params.particleSpeed]);

  // Handle color or speed changes for existing particles
  useEffect(() => {
    const colors = activeColors.length > 0 ? activeColors : ["#00AEEF", "#6A00FF", "#DFFF7A"];
    particlesRef.current.forEach((p) => {
      p.color = colors[Math.floor(Math.random() * colors.length)];
      // Update velocity magnitude to match current particle speed param
      const angle = Math.atan2(p.vy, p.vx);
      const mag = (Math.random() * 0.8 + 0.4) * params.particleSpeed;
      p.vx = Math.cos(angle) * mag;
      p.vy = Math.sin(angle) * mag - 0.1;
    });
  }, [activeColors, params.particleSpeed]);

  // Main rendering loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    // Set high-DPI scaling
    const dpr = window.devicePixelRatio || 1;
    canvas.width = dimensions.width * dpr;
    canvas.height = dimensions.height * dpr;
    ctx.scale(dpr, dpr);

    const colors = activeColors.length > 0 ? activeColors : ["#00AEEF", "#6A00FF", "#DFFF7A"];

    const render = () => {
      // 1. Draw Background (Smooth fade to allow trails if desired, or solid deep black)
      ctx.fillStyle = backgroundColor || "#050505";
      ctx.fillRect(0, 0, dimensions.width, dimensions.height);

      // Subtle atmospheric ambient glow from background
      const gradientBg = ctx.createRadialGradient(
        dimensions.width / 2,
        dimensions.height / 2,
        10,
        dimensions.width / 2,
        dimensions.height / 2,
        dimensions.width * 0.8
      );
      gradientBg.addColorStop(0, "rgba(106, 0, 255, 0.05)"); // translucent royal purple in center
      gradientBg.addColorStop(0.5, "rgba(0, 174, 239, 0.02)"); // translucent electric blue
      gradientBg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = gradientBg;
      ctx.fillRect(0, 0, dimensions.width, dimensions.height);

      // Increment wave time counter
      timeRef.current += 0.01 * params.speed;

      // 2. Draw Waves
      const wavesToDraw = params.waveCount;
      const stepY = dimensions.height / (wavesToDraw + 1);

      // Save standard settings
      ctx.save();
      ctx.globalCompositeOperation = "screen";

      for (let w = 0; w < wavesToDraw; w++) {
        // Build beautiful linear gradient along the wave path
        const waveGradient = ctx.createLinearGradient(0, 0, dimensions.width, 0);
        waveGradient.addColorStop(0, colors[0 % colors.length]);
        waveGradient.addColorStop(0.5, colors[1 % colors.length]);
        waveGradient.addColorStop(1, colors[2 % colors.length]);

        ctx.beginPath();

        const baseHeight = stepY * (w + 1);
        const waveOffset = w * 2.5; // Offset phase per wave for visual separation

        for (let x = 0; x <= dimensions.width; x += 3) {
          // Calculate algorithmic coordinate mapping based on flowMode
          let y = baseHeight;
          const t = timeRef.current + waveOffset;
          const xScaled = x * params.frequency;

          if (params.flowMode === "sine") {
            // Smooth harmonic undulating curves
            y += Math.sin(xScaled + t) * params.amplitude;
            y += Math.cos(xScaled * 0.5 - t * 0.7) * (params.amplitude * 0.4);
          } else if (params.flowMode === "turbulence") {
            // Highly layered chaotic waves (fractional noise simulation)
            y += Math.sin(xScaled + t) * params.amplitude;
            y += Math.sin(xScaled * 2.1 + t * 1.4) * (params.amplitude * 0.35);
            y += Math.sin(xScaled * 4.3 - t * 2.5) * (params.amplitude * 0.15);
            y += Math.cos(xScaled * 8.5 + t * 0.9) * (params.amplitude * 0.08);
          } else if (params.flowMode === "quantum") {
            // Rapid micro-shivers and static spikes
            y += Math.sin(xScaled + t) * (params.amplitude * 0.8);
            y += (Math.random() - 0.5) * params.noiseLevel * 0.3; // static sizzle
            // High frequency secondary wave
            y += Math.sin(xScaled * 12 + t * 6) * (params.amplitude * 0.12);
          } else if (params.flowMode === "linear") {
            // Minimal, elegant high-velocity streams
            y += Math.sin(xScaled * 0.5 + t * 1.5) * (params.amplitude * 0.4);
            y += Math.cos(xScaled * 1.5 - t * 1.2) * (params.amplitude * 0.15);
          }

          // Apply mouse interaction distorting the waves directly
          if (mouseRef.current.active) {
            const dx = x - mouseRef.current.x;
            const dy = y - mouseRef.current.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const radius = 150;

            if (dist < radius) {
              const force = (1 - dist / radius) * params.interactiveForce;
              if (params.interactionMode === "distort") {
                y += Math.sin(dx * 0.05) * force * 1.5;
              } else if (params.interactionMode === "attract") {
                y += (mouseRef.current.y - y) * (force * 0.04);
              } else if (params.interactionMode === "repel") {
                y += (y - mouseRef.current.y) * (force * 0.04);
              }
            }
          }

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        // Sleek cyber-luxury vector line aesthetics
        ctx.strokeStyle = waveGradient;
        ctx.lineWidth = 1.8 + (w * 0.4);
        
        // Soft volumetric neon glow around the primary wave edges
        ctx.shadowBlur = params.glowIntensity;
        ctx.shadowColor = colors[w % colors.length];

        ctx.stroke();

        // Secondary ultra-fine decorative outline without heavy blur for crispness
        ctx.shadowBlur = 0;
        ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      ctx.restore();

      // 3. Draw & Update Glowing Particles
      ctx.save();
      ctx.globalCompositeOperation = "screen";

      particlesRef.current.forEach((p) => {
        // Move particle
        p.x += p.vx;
        p.y += p.vy;

        // Apply noise based on flowMode to give cinematic movement pathways
        if (params.flowMode === "turbulence" || params.flowMode === "quantum") {
          p.x += (Math.random() - 0.5) * 0.5;
          p.y += (Math.random() - 0.5) * 0.5;
        }

        // Apply mouse pointer interaction forces
        if (mouseRef.current.active) {
          const dx = mouseRef.current.x - p.x;
          const dy = mouseRef.current.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const limit = 180;

          if (dist < limit) {
            const force = (1 - dist / limit) * params.interactiveForce * 0.5;
            const angle = Math.atan2(dy, dx);

            if (params.interactionMode === "attract") {
              p.x += Math.cos(angle) * force * 1.8;
              p.y += Math.sin(angle) * force * 1.8;
              p.size = p.originalSize * (1 + (1 - dist / limit) * 1.5); // expand size as they gather
            } else if (params.interactionMode === "repel") {
              p.x -= Math.cos(angle) * force * 2.2;
              p.y -= Math.sin(angle) * force * 2.2;
              p.size = p.originalSize * (1 - (1 - dist / limit) * 0.5); // shrink as they flee
            } else if (params.interactionMode === "distort") {
              // Orbital swirl around the mouse pointer
              p.x += Math.sin(angle + Math.PI / 2) * force * 2;
              p.y -= Math.cos(angle + Math.PI / 2) * force * 2;
            }
          } else {
            // Decay size back to original
            p.size += (p.originalSize - p.size) * 0.05;
          }
        } else {
          p.size += (p.originalSize - p.size) * 0.05;
        }

        // Boundaries warp wrapping
        if (p.x < -10) p.x = dimensions.width + 10;
        if (p.x > dimensions.width + 10) p.x = -10;
        if (p.y < -10) p.y = dimensions.height + 10;
        if (p.y > dimensions.height + 10) p.y = -10;

        // Draw particle with soft atmospheric luminous edges (radial gradient)
        const radGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2);
        radGrad.addColorStop(0, p.color);
        radGrad.addColorStop(0.3, p.color);
        radGrad.addColorStop(1, "rgba(0,0,0,0)");

        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.restore();

      // Loop frame
      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [dimensions, params, activeColors, backgroundColor]);

  // Track mouse movements to apply kinetic forces
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      active: true,
    };
  };

  const handleMouseLeave = () => {
    mouseRef.current.active = false;
  };

  // Capture canvas output directly as a download
  const handleCapture = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = url;
    link.download = `ultrasonic-energy-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[500px] rounded-2xl overflow-hidden border border-neutral-800 bg-[#050505] shadow-2xl flex items-center justify-center group"
      id="visualizer-container"
    >
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="absolute top-0 left-0 w-full h-full cursor-crosshair block"
        style={{ touchAction: "none" }}
        id="visualizer-canvas"
      />

      {/* Elegant overlays */}
      <div className="absolute top-4 left-4 flex flex-col gap-1 pointer-events-none select-none z-10">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-400">
            Render Node: Kinetic Synthesis
          </span>
        </div>
        <h3 className="text-sm font-medium text-white tracking-wider">
          Flow Style: <span className="capitalize font-semibold text-[#DFFF7A]">{params.flowMode}</span>
        </h3>
      </div>

      <div className="absolute bottom-4 right-4 z-10 transition-opacity duration-300 opacity-0 group-hover:opacity-100 flex gap-2">
        <button
          onClick={handleCapture}
          className="px-3.5 py-1.5 bg-white/10 hover:bg-white/25 backdrop-blur-md border border-white/10 hover:border-white/20 text-xs font-mono text-white rounded-lg flex items-center gap-1.5 cursor-pointer shadow-lg active:scale-95 transition-all"
          title="Capture high-resolution snapshot"
          id="btn-capture-snapshot"
        >
          <svg
            className="w-3.5 h-3.5 text-[#DFFF7A]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          Export PNG
        </button>
      </div>

      {/* Guide text */}
      <div className="absolute bottom-4 left-4 pointer-events-none select-none text-[10px] font-mono text-neutral-500 tracking-wider bg-black/40 backdrop-blur-sm py-1 px-2.5 rounded-md border border-white/5 z-10">
        Hover mouse or touch to interact with ultrasonic energy waves
      </div>
    </div>
  );
}
