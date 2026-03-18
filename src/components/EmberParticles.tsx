import { useEffect, useRef, useState } from "react";

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  life: number;
  maxLife: number;
  // Color properties for realistic ember
  coreHue: number;
  glowIntensity: number;
  // Trail
  trail: { x: number; y: number; opacity: number }[];
}

const EmberParticles = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Detect mobile for performance optimization
    const isMobile = window.innerWidth < 768 || /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
    const particleCount = isMobile ? 30 : 80;
    const maxTrailLength = isMobile ? 4 : 8;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const createParticle = (): Particle => {
      const maxLife = Math.random() * 400 + 200;
      return {
        x: Math.random() * canvas.width,
        y: canvas.height + Math.random() * 100,
        size: Math.random() * 4 + 0.5, // Varied sizes from tiny spark to large ember
        speedX: (Math.random() - 0.5) * 0.8,
        speedY: -Math.random() * 1.5 - 0.3, // Rising motion
        opacity: Math.random() * 0.4 + 0.6,
        life: 0,
        maxLife,
        coreHue: Math.random() * 40 + 20, // 20-60 (orange-yellow range)
        glowIntensity: Math.random() * 0.5 + 0.5,
        trail: [],
      };
    };

    // Initialize particles
    particlesRef.current = [];
    for (let i = 0; i < particleCount; i++) {
      const particle = createParticle();
      particle.y = Math.random() * canvas.height;
      particle.life = Math.random() * particle.maxLife;
      particlesRef.current.push(particle);
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((particle, index) => {
        // Update life
        particle.life++;

        // Calculate life progress (0 to 1)
        const lifeProgress = particle.life / particle.maxLife;

        // Opacity based on life cycle: fade in, burn bright, fade out
        let lifeOpacity = 1;
        if (lifeProgress < 0.1) {
          lifeOpacity = lifeProgress / 0.1; // Fade in
        } else if (lifeProgress > 0.7) {
          lifeOpacity = 1 - (lifeProgress - 0.7) / 0.3; // Fade out
        }

        // Add to trail
        particle.trail.push({ x: particle.x, y: particle.y, opacity: particle.opacity * lifeOpacity * 0.3 });
        if (particle.trail.length > maxTrailLength) {
          particle.trail.shift();
        }

        // Update position with thermal convection simulation
        const turbulence = Math.sin(particle.life * 0.05) * 0.3;
        particle.x += particle.speedX + turbulence;
        particle.y += particle.speedY;

        // Natural flickering
        particle.opacity += (Math.random() - 0.5) * 0.08;
        particle.opacity = Math.max(0.3, Math.min(1, particle.opacity));

        // Slight horizontal drift
        particle.speedX += (Math.random() - 0.5) * 0.02;
        particle.speedX = Math.max(-0.8, Math.min(0.8, particle.speedX));

        const currentOpacity = particle.opacity * lifeOpacity;

        // Draw smoke trail (subtle)
        particle.trail.forEach((point, i) => {
          const trailOpacity = (i / particle.trail.length) * point.opacity * 0.15;
          const trailSize = particle.size * (0.3 + (i / particle.trail.length) * 0.5);

          ctx.beginPath();
          ctx.arc(point.x, point.y, trailSize, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(80, 60, 50, ${trailOpacity})`;
          ctx.fill();
        });

        // Draw outer glow (red-orange)
        const outerGlow = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size * 6
        );
        outerGlow.addColorStop(0, `hsla(${particle.coreHue - 10}, 100%, 50%, ${currentOpacity * 0.4})`);
        outerGlow.addColorStop(0.3, `hsla(${particle.coreHue - 15}, 100%, 40%, ${currentOpacity * 0.2})`);
        outerGlow.addColorStop(1, `hsla(0, 100%, 30%, 0)`);

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 6, 0, Math.PI * 2);
        ctx.fillStyle = outerGlow;
        ctx.fill();

        // Draw middle glow (orange)
        const middleGlow = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size * 3
        );
        middleGlow.addColorStop(0, `hsla(${particle.coreHue}, 100%, 60%, ${currentOpacity * 0.7})`);
        middleGlow.addColorStop(0.5, `hsla(${particle.coreHue - 5}, 100%, 50%, ${currentOpacity * 0.4})`);
        middleGlow.addColorStop(1, `hsla(${particle.coreHue - 10}, 100%, 40%, 0)`);

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = middleGlow;
        ctx.fill();

        // Draw inner core (yellow-white, hottest part)
        const coreGlow = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size * 1.2
        );
        coreGlow.addColorStop(0, `hsla(50, 100%, 95%, ${currentOpacity})`); // Almost white center
        coreGlow.addColorStop(0.3, `hsla(45, 100%, 75%, ${currentOpacity * 0.9})`); // Yellow
        coreGlow.addColorStop(0.7, `hsla(${particle.coreHue + 10}, 100%, 65%, ${currentOpacity * 0.7})`); // Orange
        coreGlow.addColorStop(1, `hsla(${particle.coreHue}, 100%, 55%, 0)`);

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 1.2, 0, Math.PI * 2);
        ctx.fillStyle = coreGlow;
        ctx.fill();

        // Reset particle if dead or off screen
        if (particle.life >= particle.maxLife || particle.y < -50) {
          particlesRef.current[index] = createParticle();
        }
        if (particle.x < -50) particle.x = canvas.width + 50;
        if (particle.x > canvas.width + 50) particle.x = -50;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-10"
      style={{ mixBlendMode: "screen", willChange: "transform" }}
    />
  );
};

export default EmberParticles;
