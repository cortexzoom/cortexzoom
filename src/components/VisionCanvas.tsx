import React, { useRef, useEffect } from "react";

interface VisionCanvasProps {
  color1: string;
  color2: string;
  color3?: string;
  movementType: string;
  speed: number;
  particleCount: number;
  frequency?: number;
  isPlaying: boolean;
  playbackSpeed: number;
  cssFilter?: string;
}

export const VisionCanvas: React.FC<VisionCanvasProps> = ({
  color1,
  color2,
  color3 = "#000000",
  movementType,
  speed,
  particleCount,
  frequency = 0.015,
  isPlaying,
  playbackSpeed,
  cssFilter = "none"
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const timeRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = canvas.width = canvas.offsetWidth || 800;
    let height = canvas.height = canvas.offsetHeight || 450;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth || 800;
      height = canvas.height = canvas.offsetHeight || 450;
    };

    window.addEventListener("resize", handleResize);

    // Initialize particles
    const particles: Array<{
      x: number;
      y: number;
      size: number;
      angle: number;
      speedX: number;
      speedY: number;
      alpha: number;
      decay: number;
    }> = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 3 + 1,
        angle: Math.random() * Math.PI * 2,
        speedX: (Math.random() - 0.5) * 1.5,
        speedY: (Math.random() - 0.5) * 1.5,
        alpha: Math.random() * 0.5 + 0.3,
        decay: Math.random() * 0.002 + 0.001
      });
    }

    const render = () => {
      if (isPlaying) {
        timeRef.current += 0.02 * speed * playbackSpeed;
      }
      const t = timeRef.current;

      // Draw background
      ctx.fillStyle = "rgba(5, 5, 8, 0.25)"; // slight trailing motion blur
      ctx.fillRect(0, 0, width, height);

      // Create a gorgeous background radial gradient
      const gradient = ctx.createRadialGradient(
        width / 2 + Math.sin(t * 0.5) * 100,
        height / 2 + Math.cos(t * 0.3) * 50,
        10,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.8
      );
      gradient.addColorStop(0, `${color1}22`);
      gradient.addColorStop(0.5, `${color2}11`);
      gradient.addColorStop(1, "#050508");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Draw movement visual patterns
      ctx.lineWidth = 2;
      ctx.strokeStyle = color2;

      if (movementType === "wave" || movementType === "nebula") {
        ctx.beginPath();
        for (let x = 0; x < width; x += 10) {
          const y =
            height / 2 +
            Math.sin(x * frequency + t) * 80 * Math.sin(t * 0.5) +
            Math.cos(x * 0.003 - t * 1.2) * 30;
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.shadowColor = color1;
        ctx.shadowBlur = 15;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Draw helper wave
        ctx.strokeStyle = `${color1}bb`;
        ctx.beginPath();
        for (let x = 0; x < width; x += 15) {
          const y =
            height / 2 +
            Math.cos(x * frequency * 1.5 - t) * 50 * Math.sin(t * 0.7) +
            Math.sin(x * 0.005 + t) * 20;
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      } else if (movementType === "vortex") {
        ctx.save();
        ctx.translate(width / 2, height / 2);
        ctx.rotate(t * 0.2);
        ctx.shadowColor = color1;
        ctx.shadowBlur = 20;

        for (let i = 0; i < 4; i++) {
          ctx.strokeStyle = i % 2 === 0 ? color1 : color2;
          ctx.beginPath();
          for (let r = 10; r < Math.min(width, height) * 0.6; r += 15) {
            const angle = r * 0.01 + t * (i % 2 === 0 ? 0.4 : -0.3);
            const x = Math.cos(angle) * r;
            const y = Math.sin(angle) * r;
            if (r === 10) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
        ctx.restore();
        ctx.shadowBlur = 0;
      } else if (movementType === "pulse" || movementType === "float") {
        // Draw expanding neon rings
        const maxRadius = Math.min(width, height) * 0.45;
        const ringCount = 3;
        for (let i = 0; i < ringCount; i++) {
          const progress = ((t * 0.4 + i / ringCount) % 1);
          const radius = progress * maxRadius;
          ctx.beginPath();
          ctx.arc(width / 2, height / 2, radius, 0, Math.PI * 2);
          ctx.strokeStyle = color1;
          ctx.shadowColor = color2;
          ctx.shadowBlur = 10;
          ctx.globalAlpha = 1 - progress;
          ctx.lineWidth = 1 + (1 - progress) * 4;
          ctx.stroke();
        }
        ctx.globalAlpha = 1.0;
        ctx.shadowBlur = 0;

        // Draw geometric core star
        ctx.save();
        ctx.translate(width / 2, height / 2);
        ctx.rotate(-t * 0.1);
        ctx.strokeStyle = color2;
        ctx.lineWidth = 2;
        ctx.beginPath();
        const pts = 8;
        const outerR = 30 + Math.sin(t * 3) * 10;
        const innerR = 12;
        for (let i = 0; i < pts * 2; i++) {
          const angle = (i * Math.PI) / pts;
          const r = i % 2 === 0 ? outerR : innerR;
          const px = Math.cos(angle) * r;
          const py = Math.sin(angle) * r;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
      }

      // Render, move and cycle particles
      particles.forEach((p) => {
        if (isPlaying) {
          if (movementType === "vortex") {
            const dx = p.x - width / 2;
            const dy = p.y - height / 2;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx) + 0.02 * speed * playbackSpeed * (150 / (dist + 50));
            p.x = width / 2 + Math.cos(angle) * dist + (Math.random() - 0.5) * 0.5;
            p.y = height / 2 + Math.sin(angle) * dist + (Math.random() - 0.5) * 0.5;

            if (dist < 10 || dist > Math.max(width, height)) {
              p.x = width / 2 + (Math.random() - 0.5) * width * 0.8;
              p.y = height / 2 + (Math.random() - 0.5) * height * 0.8;
            }
          } else {
            p.x += p.speedX * speed * playbackSpeed;
            p.y += p.speedY * speed * playbackSpeed;

            // Bounce / Wrap boundaries
            if (p.x < 0) p.x = width;
            if (p.x > width) p.x = 0;
            if (p.y < 0) p.y = height;
            if (p.y > height) p.y = 0;
          }
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = color1;
        ctx.shadowColor = color2;
        ctx.shadowBlur = 8;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
      });

      ctx.globalAlpha = 1.0;
      ctx.shadowBlur = 0;

      // Draw scanline grid HUD overlay
      ctx.fillStyle = "rgba(255, 255, 255, 0.02)";
      for (let y = 0; y < height; y += 4) {
        ctx.fillRect(0, y, width, 1);
      }

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [color1, color2, movementType, speed, particleCount, isPlaying, playbackSpeed, frequency]);

  // Handle visual post-process filters
  const filterStyles: React.CSSProperties = {
    filter: cssFilter === "none" ? "" : cssFilter,
    width: "100%",
    height: "100%",
    transition: "filter 0.3s ease"
  };

  return (
    <div className="w-full h-full overflow-hidden bg-[#050508] relative rounded-xl border border-neutral-800">
      <canvas ref={canvasRef} style={filterStyles} className="block w-full h-full" />
    </div>
  );
};
