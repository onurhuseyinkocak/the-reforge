import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useMemo } from "react";

const ForgeAnimation = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const hammerRotate = useTransform(scrollYProgress, [0.2, 0.32, 0.38, 0.50, 0.56], [0, -50, 0, -50, 0]);
  const sparksOpacity = useTransform(scrollYProgress, [0.30, 0.35, 0.40, 0.48, 0.53, 0.58], [0, 1, 0, 0, 1, 0]);
  const anvilGlow = useTransform(scrollYProgress, [0.25, 0.38, 0.45, 0.56], [0.3, 1, 0.6, 1]);
  const textOpacity = useTransform(scrollYProgress, [0.55, 0.72], [0, 1]);
  const textY = useTransform(scrollYProgress, [0.55, 0.72], [40, 0]);
  const steelPulse = useTransform(scrollYProgress, [0.3, 0.4, 0.5, 0.6], [0.5, 1, 0.7, 1]);

  const sparks = useMemo(() =>
    [...Array(20)].map((_, i) => {
      const angle = (i / 20) * Math.PI * 2;
      const distance = 80 + Math.random() * 120;
      return {
        id: i,
        angle,
        x: 200 + Math.cos(angle) * distance,
        y: 210 + Math.sin(angle) * distance * 0.5 - 30,
        size: 2.5 + Math.random() * 4,
        hue: 15 + Math.random() * 35,
        lightness: 55 + Math.random() * 30,
        moveX: Math.cos(angle) * (40 + Math.random() * 30),
        moveY: Math.sin(angle) * (25 + Math.random() * 20) - 20,
      };
    }), []);

  return (
    <section ref={containerRef} className="relative h-[150vh] overflow-hidden">
      <div className="sticky top-0 h-screen flex items-center justify-center bg-[hsl(0,0%,5%)]">
        {/* Background horizontal lines */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.02]">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="absolute left-0 right-0 h-[1px] bg-white" style={{ top: `${20 + i * 12}%` }} />
          ))}
        </div>

        {/* MASSIVE radial glow behind anvil */}
        <motion.div
          style={{ opacity: anvilGlow }}
          className="absolute w-[1000px] h-[700px] pointer-events-none"
        >
          <div className="w-full h-full rounded-full" style={{
            background: "radial-gradient(ellipse, hsl(16 100% 50% / 0.2) 0%, hsl(0 80% 40% / 0.12) 30%, hsl(16 80% 40% / 0.05) 50%, transparent 70%)",
          }} />
        </motion.div>

        {/* Secondary glow - floor reflection */}
        <motion.div
          style={{ opacity: anvilGlow }}
          className="absolute bottom-[10%] w-[800px] h-[200px] pointer-events-none"
        >
          <div className="w-full h-full" style={{
            background: "radial-gradient(ellipse, hsl(16 100% 50% / 0.06) 0%, transparent 70%)",
          }} />
        </motion.div>

        <div className="relative w-[600px] h-[600px] md:w-[700px] md:h-[700px]">
          {/* Anvil SVG - LARGE */}
          <svg viewBox="0 0 400 400" className="absolute inset-0 w-full h-full">
            {/* Anvil base/stand */}
            <path
              d="M160 310 L240 310 L250 350 L150 350 Z"
              fill="hsl(220, 8%, 10%)"
              stroke="hsl(220, 5%, 20%)"
              strokeWidth="1"
            />
            {/* Anvil body - BRIGHTER */}
            <path
              d="M115 250 L140 205 L260 205 L285 250 L315 250 L315 285 L305 310 L95 310 L85 285 L85 250 Z"
              fill="hsl(220, 8%, 16%)"
              stroke="hsl(220, 5%, 30%)"
              strokeWidth="1.5"
            />
            {/* Body highlight */}
            <path
              d="M115 250 L140 205 L260 205 L285 250 Z"
              fill="hsl(220, 8%, 20%)"
              opacity="0.5"
            />
            {/* Anvil horn (left) */}
            <path
              d="M140 205 L140 195 L90 185 L85 190 L85 200 L130 205 Z"
              fill="hsl(220, 8%, 18%)"
              stroke="hsl(220, 5%, 32%)"
              strokeWidth="1"
            />
            {/* Anvil horn (right) */}
            <path
              d="M260 205 L260 195 L310 185 L315 190 L315 200 L270 205 Z"
              fill="hsl(220, 8%, 18%)"
              stroke="hsl(220, 5%, 32%)"
              strokeWidth="1"
            />
            {/* Anvil face - bright top surface */}
            <rect x="138" y="197" width="124" height="8" rx="1"
              fill="hsl(220, 8%, 24%)"
            />
            {/* Face edge highlight */}
            <rect x="138" y="197" width="124" height="2" rx="1"
              fill="hsl(220, 8%, 28%)"
              opacity="0.6"
            />

            {/* HOT STEEL on anvil - BRIGHT AND GLOWING */}
            <motion.g style={{ opacity: steelPulse }}>
              <rect x="170" y="188" width="60" height="10" rx="2"
                fill="hsl(25, 100%, 60%)"
              />
              {/* Inner bright core */}
              <rect x="175" y="190" width="50" height="6" rx="1"
                fill="hsl(40, 100%, 70%)"
              />
              {/* White-hot center */}
              <rect x="185" y="191" width="30" height="4" rx="1"
                fill="hsl(45, 100%, 85%)"
                opacity="0.8"
              />
            </motion.g>

            {/* Steel glow effect */}
            <motion.ellipse
              cx="200" cy="193" rx="60" ry="25"
              fill="hsl(16, 100%, 50%)"
              style={{ opacity: useTransform(anvilGlow, (v: number) => v * 0.15) }}
            />
            <motion.ellipse
              cx="200" cy="193" rx="35" ry="15"
              fill="hsl(30, 100%, 60%)"
              style={{ opacity: useTransform(anvilGlow, (v: number) => v * 0.1) }}
            />
          </svg>

          {/* Hammer - BIGGER */}
          <motion.div
            style={{ rotate: hammerRotate }}
            className="absolute top-[2%] left-1/2 -translate-x-1/2 origin-bottom"
          >
            <svg viewBox="0 0 120 300" className="w-[100px] h-[260px] md:w-[120px] md:h-[280px]">
              {/* Handle */}
              <rect x="53" y="90" width="14" height="210" rx="4" fill="hsl(25, 35%, 22%)" />
              <rect x="56" y="90" width="4" height="210" rx="2" fill="hsl(25, 35%, 30%)" opacity="0.5" />
              {/* Handle grip lines */}
              {[0,1,2,3,4].map(i => (
                <rect key={i} x="53" y={250 + i * 12} width="14" height="2" rx="1" fill="hsl(25, 30%, 18%)" opacity="0.5" />
              ))}
              {/* Head */}
              <rect x="18" y="50" width="84" height="45" rx="5" fill="hsl(220, 8%, 18%)" />
              {/* Head top highlight */}
              <rect x="18" y="50" width="84" height="8" rx="3" fill="hsl(220, 8%, 24%)" opacity="0.4" />
              {/* Head face (striking surface) */}
              <rect x="20" y="90" width="80" height="6" rx="2" fill="hsl(220, 8%, 22%)" opacity="0.6" />
              {/* Side bevels */}
              <rect x="18" y="55" width="4" height="35" rx="1" fill="hsl(220, 8%, 24%)" opacity="0.3" />
              <rect x="98" y="55" width="4" height="35" rx="1" fill="hsl(220, 8%, 15%)" opacity="0.3" />
            </svg>
          </motion.div>

          {/* SPARKS - bigger, brighter, more */}
          <motion.div style={{ opacity: sparksOpacity }} className="absolute inset-0 pointer-events-none">
            {sparks.map((spark) => (
              <motion.div
                key={spark.id}
                className="absolute rounded-full"
                style={{
                  left: `${(spark.x / 400) * 100}%`,
                  top: `${(spark.y / 400) * 100}%`,
                  width: spark.size,
                  height: spark.size,
                  background: `hsl(${spark.hue}, 100%, ${spark.lightness}%)`,
                  boxShadow: `0 0 ${spark.size * 4}px hsl(${spark.hue}, 100%, 60%, 0.7)`,
                }}
                animate={{
                  x: [0, spark.moveX],
                  y: [0, spark.moveY],
                  opacity: [1, 0],
                  scale: [1, 0.2],
                }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  repeatDelay: 1.2,
                  delay: spark.id * 0.04,
                }}
              />
            ))}
          </motion.div>
        </div>

        {/* Text */}
        <motion.div
          style={{ opacity: textOpacity, y: textY }}
          className="absolute bottom-[12%] text-center"
        >
          <p className="font-display text-5xl md:text-7xl lg:text-8xl text-primary tracking-[0.15em]" style={{
            textShadow: "0 0 60px hsl(16 100% 50% / 0.5), 0 0 120px hsl(16 100% 50% / 0.25)",
          }}>
            ATEŞTE DÖVÜL
          </p>
          <div className="flex items-center justify-center gap-4 mt-6">
            <div className="w-12 h-[1px] bg-primary/30" />
            <p className="text-sm text-muted-foreground/60 tracking-[0.4em] uppercase">
              Ya çelikleş, ya kül ol
            </p>
            <div className="w-12 h-[1px] bg-primary/30" />
          </div>
        </motion.div>

        {/* Corner accents */}
        <div className="absolute bottom-8 left-8 opacity-20">
          <div className="w-12 h-[1px] bg-primary/50" />
          <div className="w-[1px] h-12 bg-primary/50" />
        </div>
        <div className="absolute bottom-8 right-8 opacity-20">
          <div className="w-12 h-[1px] bg-primary/50 ml-auto" />
          <div className="w-[1px] h-12 bg-primary/50 ml-auto" />
        </div>
      </div>
    </section>
  );
};

export default ForgeAnimation;
