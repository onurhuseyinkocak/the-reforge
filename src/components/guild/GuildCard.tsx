import { motion } from "framer-motion";
import { type Guild, TIER_CONFIG, LEVEL_CONFIG, getHeatLabel } from "@/types/guild";
import TierBadge from "./TierBadge";
import HeatMeter from "./HeatMeter";
import { Users, TrendingUp, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface GuildCardProps {
  guild: Guild;
  index?: number;
}

export default function GuildCard({ guild, index = 0 }: GuildCardProps) {
  const navigate = useNavigate();
  const tierConfig = TIER_CONFIG[guild.tier];
  const levelConfig = LEVEL_CONFIG[guild.level] || LEVEL_CONFIG[1];
  const heat = getHeatLabel(guild.heat_level);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      onClick={() => navigate(`/guilds/dashboard`)}
      className="group relative cursor-pointer"
    >
      {/* Hover glow */}
      <motion.div
        className="absolute -inset-[1px] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `linear-gradient(135deg, ${tierConfig.color}33, transparent, ${tierConfig.color}22)`,
          filter: 'blur(1px)',
        }}
      />

      {/* Card */}
      <div className="relative rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl overflow-hidden">
        {/* Top accent line */}
        <div className="h-[2px] w-full" style={{ background: `linear-gradient(90deg, transparent, ${tierConfig.color}, transparent)` }} />

        {/* Content */}
        <div className="p-5">
          {/* Header: Emblem + Info */}
          <div className="flex items-start gap-4">
            {/* Emblem placeholder */}
            <div
              className="h-16 w-16 rounded-xl flex items-center justify-center shrink-0 relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${tierConfig.color}15, ${tierConfig.color}05)`,
                border: `1px solid ${tierConfig.color}33`
              }}
            >
              {guild.emblem_url ? (
                <img src={guild.emblem_url} alt={guild.name} className="h-full w-full object-cover rounded-xl" />
              ) : (
                <Shield size={28} style={{ color: tierConfig.color }} strokeWidth={1.5} />
              )}
              {/* Subtle shine */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent"
                animate={{ opacity: [0, 0.3, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-display text-lg text-foreground truncate tracking-wide">
                  {guild.name}
                </h3>
              </div>
              {guild.motto && (
                <p className="text-xs text-muted-foreground italic truncate">"{guild.motto}"</p>
              )}
              <div className="flex items-center gap-3 mt-2">
                <TierBadge tier={guild.tier} size="sm" showLabel={false} />
                <span className="text-xs text-muted-foreground">
                  Lv.{guild.level} {levelConfig.name}
                </span>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/[0.06]">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Users size={14} />
              <span className="text-xs">{guild.member_count}/{guild.max_members}</span>
            </div>
            <HeatMeter level={guild.heat_level} size="sm" showLabel={false} />
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <TrendingUp size={14} />
              <span className="text-xs">{guild.season_points.toLocaleString()} SP</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
