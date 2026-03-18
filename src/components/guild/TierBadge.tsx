import { motion } from "framer-motion";
import { type GuildTier, TIER_CONFIG } from "@/types/guild";

interface TierBadgeProps {
  tier: GuildTier;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export default function TierBadge({ tier, size = "md", showLabel = true }: TierBadgeProps) {
  const config = TIER_CONFIG[tier];
  const sizes = { sm: "h-6 w-6 text-[10px]", md: "h-9 w-9 text-xs", lg: "h-14 w-14 text-sm" };

  return (
    <motion.div
      className="relative inline-flex items-center gap-2"
      whileHover={{ scale: 1.05 }}
    >
      <motion.div
        className={`${sizes[size]} rounded-lg flex items-center justify-center font-bold font-display relative overflow-hidden`}
        style={{
          background: `linear-gradient(135deg, ${config.color}22, ${config.color}44)`,
          border: `1px solid ${config.color}66`,
          color: config.color,
          boxShadow: `0 0 20px ${config.glow}, inset 0 0 20px ${config.glow}`
        }}
        animate={tier === 'obsidian' ? {
          boxShadow: [
            `0 0 20px ${config.glow}, inset 0 0 20px ${config.glow}`,
            `0 0 40px ${config.glow}, inset 0 0 30px ${config.glow}`,
            `0 0 20px ${config.glow}, inset 0 0 20px ${config.glow}`,
          ]
        } : undefined}
        transition={tier === 'obsidian' ? { duration: 2, repeat: Infinity } : undefined}
      >
        {/* Diamond shimmer effect */}
        {tier === 'diamond' && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
        )}
        {/* Tier initial */}
        <span className="relative z-10">{config.label[0]}</span>
      </motion.div>
      {showLabel && (
        <span className="text-sm font-medium" style={{ color: config.color }}>
          {config.label}
        </span>
      )}
    </motion.div>
  );
}
