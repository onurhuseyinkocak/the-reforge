import { motion, useSpring } from "framer-motion";
import { getHeatLabel } from "@/types/guild";
import { Flame } from "lucide-react";

interface HeatMeterProps {
  level: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export default function HeatMeter({ level, size = "md", showLabel = true }: HeatMeterProps) {
  const heat = getHeatLabel(level);
  const spring = useSpring(level, { stiffness: 50, damping: 20 });

  const sizes = { sm: 32, md: 48, lg: 64 };
  const s = sizes[size];

  const getFlameColor = (l: number) => {
    if (l >= 80) return '#FFFFFF';
    if (l >= 60) return '#FFD700';
    if (l >= 40) return '#FF8C00';
    if (l >= 20) return '#FF4500';
    return '#666666';
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative" style={{ width: s, height: s }}>
        {/* Background glow */}
        {level >= 50 && (
          <motion.div
            className="absolute inset-0 rounded-full blur-xl"
            style={{ background: getFlameColor(level) }}
            animate={{ opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
        {/* Flame icon */}
        <motion.div
          className="relative z-10 flex items-center justify-center"
          style={{ width: s, height: s }}
          animate={level >= 80 ? {
            scale: [1, 1.1, 1],
            filter: ['brightness(1)', 'brightness(1.5)', 'brightness(1)']
          } : level < 25 ? {
            opacity: [0.5, 0.7, 0.5]
          } : undefined}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <Flame
            size={s * 0.7}
            style={{ color: getFlameColor(level) }}
            strokeWidth={1.5}
            fill={level >= 50 ? getFlameColor(level) + '44' : 'none'}
          />
        </motion.div>
        {/* Level number overlay */}
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <span
            className="font-display text-xs font-bold"
            style={{ color: level >= 60 ? '#000' : getFlameColor(level), fontSize: s * 0.22 }}
          >
            {level}
          </span>
        </div>
      </div>
      {showLabel && (
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">Heat Level</span>
          <span className="text-sm font-semibold" style={{ color: heat.color }}>
            {heat.label}
          </span>
        </div>
      )}
    </div>
  );
}
