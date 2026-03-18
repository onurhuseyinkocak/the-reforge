import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  life: number;
  maxLife: number;
  coreHue: number;
  glowIntensity: number;
  trail: { x: number; y: number; opacity: number }[];
  isFlare: boolean;
}

interface HeatWave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  opacity: number;
}

const EmberParticles = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const heatWavesRef = useRef<HeatWave[]>([]);
  const animationRef = useRef<number>();
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile ? 30 : 70;
    const maxTrailLength = isMobile ? 5 : 10;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const createParticle = (isFlare = false): Particle => {
      const maxLife = isFlare ? 150 + Math.random() * 100 : Math.random() * 500 + 200;
      return {
        x: Math.random() * canvas.width,
        y: canvas.height + Math.random() * 50,
        size: isFlare ? 4 + Math.random() * 4 : Math.random() * 3 + 0.3,
        speedX: isFlare ? (Math.random() - 0.5) * 2 : (Math.random() - 0.5) * 0.8,
        speedY: isFlare ? -3 - Math.random() * 3 : -Math.random() * 1.5 - 0.3,
        opacity: isFlare ? 1 : Math.random() * 0.5 + 0.5,
        life: 0,
        maxLife,
        coreHue: isFlare ? 40 + Math.random() * 20 : Math.random() * 40 + 15,
        glowIntensity: isFlare ? 1 : Math.random() * 0.5 + 0.5,
        trail: [],
        isFlare,
      };
    };

    // Initialize particles - cluster toward bottom
    particlesRef.current = [];
    for (let i = 0; i < particleCount; i++) {
      const particle = createParticle();
      particle.y = canvas.height * (0.4 + Math.random() * 0.6); // Bottom 60%
      particle.life = Math.random() * particle.maxLife;
      particlesRef.current.push(particle);
    }

    const animate = () => {
      frameRef.current++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Spawn flare every ~120 frames
      if (frameRef.current % 240 === 0 && !isMobile) {
        const flare = createParticle(true);
        flare.x = canvas.width * 0.3 + Math.random() * canvas.width * 0.4;
        particlesRef.current.push(flare);
      }

      // Spawn heat waves
      if (frameRef.current % 200 === 0 && !isMobile) {
        heatWavesRef.current.push({
          x: canvas.width * 0.2 + Math.random() * canvas.width * 0.6,
          y: canvas.height,
          radius: 0,
          maxRadius: 150 + Math.random() * 100,
          opacity: 0.03,
        });
      }

      // Draw heat waves
      heatWavesRef.current = heatWavesRef.current.filter((wave) => {
        wave.y -= 0.3;
        wave.radius += 0.5;
        wave.opacity *= 0.998;

        if (wave.opacity < 0.005 || wave.radius > wave.maxRadius) return false;

        ctx.beginPath();
        ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(16, 80%, 50%, ${wave.opacity})`;
        ctx.lineWidth = 1;
        ctx.stroke();
        return true;
      });

      // Draw particles
      particlesRef.current.forEach((particle, index) => {
        particle.life++;
        const lifeProgress = particle.life / particle.maxLife;

        let lifeOpacity = 1;
        if (lifeProgress < 0.1) lifeOpacity = lifeProgress / 0.1;
        else if (lifeProgress > 0.7) lifeOpacity = 1 - (lifeProgress - 0.7) / 0.3;

        // Trail
        particle.trail.push({ x: particle.x, y: particle.y, opacity: particle.opacity * lifeOpacity * 0.3 });
        if (particle.trail.length > maxTrailLength) particle.trail.shift();

        // Update position
        const turbulence = Math.sin(particle.life * 0.04) * (particle.isFlare ? 0.5 : 0.3);
        particle.x += particle.speedX + turbulence;
        particle.y += particle.speedY;

        // Flickering
        particle.opacity += (Math.random() - 0.5) * 0.1;
        particle.opacity = Math.max(0.2, Math.min(1, particle.opacity));
        particle.speedX += (Math.random() - 0.5) * 0.02;
        particle.speedX = Math.max(-1, Math.min(1, particle.speedX));

        const currentOpacity = particle.opacity * lifeOpacity;
        const glowMultiplier = particle.isFlare ? 2.5 : 1;

        // Draw trail
        particle.trail.forEach((point, i) => {
          const trailOpacity = (i / particle.trail.length) * point.opacity * 0.2;
          const trailSize = particle.size * (0.3 + (i / particle.trail.length) * 0.5);
          ctx.beginPath();
          ctx.arc(point.x, point.y, trailSize, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(100, 60, 40, ${trailOpacity})`;
          ctx.fill();
        });

        // Outer glow
        const outerGlow = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size * 8 * glowMultiplier
        );
        outerGlow.addColorStop(0, `hsla(${particle.coreHue - 10}, 100%, 50%, ${currentOpacity * 0.5})`);
        outerGlow.addColorStop(0.3, `hsla(${particle.coreHue - 15}, 100%, 40%, ${currentOpacity * 0.25})`);
        outerGlow.addColorStop(1, `hsla(0, 100%, 30%, 0)`);
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 8 * glowMultiplier, 0, Math.PI * 2);
        ctx.fillStyle = outerGlow;
        ctx.fill();

        // Middle glow
        const middleGlow = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size * 4 * glowMultiplier
        );
        middleGlow.addColorStop(0, `hsla(${particle.coreHue}, 100%, 65%, ${currentOpacity * 0.8})`);
        middleGlow.addColorStop(0.5, `hsla(${particle.coreHue - 5}, 100%, 55%, ${currentOpacity * 0.5})`);
        middleGlow.addColorStop(1, `hsla(${particle.coreHue - 10}, 100%, 45%, 0)`);
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 4 * glowMultiplier, 0, Math.PI * 2);
        ctx.fillStyle = middleGlow;
        ctx.fill();

        // Inner core - brighter
        const coreGlow = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size * 1.5 * glowMultiplier
        );
        coreGlow.addColorStop(0, `hsla(55, 100%, 97%, ${currentOpacity})`);
        coreGlow.addColorStop(0.2, `hsla(50, 100%, 85%, ${currentOpacity * 0.95})`);
        coreGlow.addColorStop(0.5, `hsla(${particle.coreHue + 15}, 100%, 70%, ${currentOpacity * 0.8})`);
        coreGlow.addColorStop(1, `hsla(${particle.coreHue}, 100%, 55%, 0)`);
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 1.5 * glowMultiplier, 0, Math.PI * 2);
        ctx.fillStyle = coreGlow;
        ctx.fill();

        // Reset if dead
        if (particle.life >= particle.maxLife || particle.y < -80) {
          if (particle.isFlare) {
            particlesRef.current.splice(index, 1);
          } else {
            particlesRef.current[index] = createParticle();
          }
        }
        if (particle.x < -80) particle.x = canvas.width + 80;
        if (particle.x > canvas.width + 80) particle.x = -80;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-[1]"
      style={{ mixBlendMode: "screen", opacity: 0.5, willChange: "transform" }}
    />
  );
};

export default EmberParticles;
