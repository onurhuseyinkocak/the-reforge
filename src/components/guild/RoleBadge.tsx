import { motion } from "framer-motion";
import { type GuildRole, GUILD_ROLE_LABELS, GUILD_ROLE_COLORS } from "@/types/guild";
import { Hammer, Swords, Shield, Flame, Circle } from "lucide-react";

interface RoleBadgeProps {
  role: GuildRole;
  size?: "sm" | "md";
}

const ROLE_ICONS: Record<GuildRole, React.ElementType> = {
  blacksmith: Hammer,
  striker: Swords,
  tempered: Shield,
  heated: Flame,
  raw: Circle,
};

export default function RoleBadge({ role, size = "md" }: RoleBadgeProps) {
  const Icon = ROLE_ICONS[role];
  const color = GUILD_ROLE_COLORS[role];
  const label = GUILD_ROLE_LABELS[role];
  const iconSize = size === "sm" ? 12 : 16;

  return (
    <motion.div
      className={`inline-flex items-center gap-1.5 rounded-full border ${size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs"} font-semibold`}
      style={{
        borderColor: color + '44',
        background: color + '15',
        color: color,
      }}
      whileHover={{ scale: 1.05, boxShadow: `0 0 12px ${color}33` }}
    >
      <Icon size={iconSize} />
      <span>{label}</span>
    </motion.div>
  );
}
