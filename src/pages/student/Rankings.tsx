import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Users, User, Flame, TrendingUp, TrendingDown, Minus, Crown, Medal, Award, ChevronUp, ChevronDown, Shield } from "lucide-react";
import { TIER_CONFIG, RANK_CONFIG, type GuildTier, type PersonalRank } from "@/types/guild";
import TierBadge from "@/components/guild/TierBadge";

const MOCK_GUILD_RANKINGS = [
  { rank: 1, name: 'OBSIDIAN FORGE', tier: 'obsidian' as GuildTier, sp: 11200, heat: 98, members: 87, change: 'up' },
  { rank: 2, name: 'SILENT HAMMERS', tier: 'diamond' as GuildTier, sp: 7500, heat: 85, members: 62, change: 'up' },
  { rank: 3, name: 'IRON WOLVES', tier: 'diamond' as GuildTier, sp: 4800, heat: 92, members: 38, change: 'same' },
  { rank: 4, name: 'PHOENIX GUARD', tier: 'gold' as GuildTier, sp: 3200, heat: 78, members: 31, change: 'down' },
  { rank: 5, name: 'STEEL BROTHERS', tier: 'gold' as GuildTier, sp: 2100, heat: 71, members: 24, change: 'up' },
  { rank: 6, name: 'EMBER LEGION', tier: 'silver' as GuildTier, sp: 1600, heat: 65, members: 16, change: 'same' },
  { rank: 7, name: 'NIGHT ANVIL', tier: 'silver' as GuildTier, sp: 890, heat: 55, members: 11, change: 'down' },
  { rank: 8, name: 'BRONZE FLAMES', tier: 'bronze' as GuildTier, sp: 450, heat: 35, members: 7, change: 'up' },
  { rank: 9, name: 'RAW RECRUITS', tier: 'bronze' as GuildTier, sp: 320, heat: 42, members: 4, change: 'same' },
];

const MOCK_PERSONAL_RANKINGS = [
  { rank: 1, name: 'Kaan Yıldırım', score: 42500, personalRank: 'diamond' as PersonalRank, guild: 'OBSIDIAN FORGE' },
  { rank: 2, name: 'Emre Demir', score: 38200, personalRank: 'diamond' as PersonalRank, guild: 'SILENT HAMMERS' },
  { rank: 3, name: 'Burak Çelik', score: 31000, personalRank: 'platinum' as PersonalRank, guild: 'OBSIDIAN FORGE' },
  { rank: 4, name: 'Arda Koç', score: 24500, personalRank: 'platinum' as PersonalRank, guild: 'IRON WOLVES' },
  { rank: 5, name: 'Yusuf Kara', score: 19800, personalRank: 'gold' as PersonalRank, guild: 'PHOENIX GUARD' },
  { rank: 6, name: 'Mert Aydın', score: 15200, personalRank: 'gold' as PersonalRank, guild: 'STEEL BROTHERS' },
  { rank: 7, name: 'Ali Şahin', score: 11500, personalRank: 'silver' as PersonalRank, guild: 'IRON WOLVES' },
  { rank: 8, name: 'Ozan Yılmaz', score: 8900, personalRank: 'silver' as PersonalRank, guild: 'EMBER LEGION' },
  { rank: 9, name: 'Can Arslan', score: 5400, personalRank: 'bronze' as PersonalRank, guild: 'NIGHT ANVIL' },
  { rank: 10, name: 'Deniz Öztürk', score: 2800, personalRank: 'steel' as PersonalRank, guild: 'BRONZE FLAMES' },
];

const RANK_MEDAL_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32'];

export default function Rankings() {
  const [tab, setTab] = useState<'guild' | 'personal'>('guild');

  return (
    <div className="min-h-screen pb-20">
      {/* Hero */}
      <div className="relative mb-8">
        <div className="absolute top-0 left-1/3 w-80 h-80 bg-amber-500/5 rounded-full blur-[120px]" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative"
        >
          <div className="flex items-center gap-3 mb-2">
            <Trophy size={28} className="text-primary" />
            <h1 className="font-display text-5xl tracking-wider">SIRALAMA</h1>
          </div>
          <p className="text-muted-foreground text-sm">Sezon: Kış Ateşi 2026 — Hafta 8/12</p>
        </motion.div>
      </div>

      {/* Season progress bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
      >
        <div className="flex justify-between text-xs text-muted-foreground mb-2">
          <span>Sezon İlerlemesi</span>
          <span>8 / 12 Hafta</span>
        </div>
        <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #FF4500, #FFD700)' }}
            initial={{ width: 0 }}
            animate={{ width: '66.7%' }}
            transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground/60 mt-1">
          <span>Ocak</span>
          <span>Sezon sonu: Mart 31</span>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex gap-2 mb-6"
      >
        {[
          { key: 'guild' as const, label: 'Lonca Sıralaması', icon: Users },
          { key: 'personal' as const, label: 'Bireysel Sıralama', icon: User },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              tab === t.key
                ? 'bg-primary/15 border border-primary/30 text-primary'
                : 'bg-white/[0.02] border border-white/[0.06] text-muted-foreground hover:text-foreground hover:bg-white/[0.04]'
            }`}
          >
            <t.icon size={16} />
            {t.label}
          </button>
        ))}
      </motion.div>

      {/* Rankings List */}
      <AnimatePresence mode="wait">
        {tab === 'guild' ? (
          <motion.div
            key="guild"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="space-y-2"
          >
            {MOCK_GUILD_RANKINGS.map((g, i) => (
              <motion.div
                key={g.rank}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
                whileHover={{ x: 4, transition: { duration: 0.15 } }}
                className={`relative flex items-center gap-4 px-5 py-4 rounded-xl border cursor-pointer transition-colors ${
                  i < 3
                    ? 'border-white/[0.1] bg-white/[0.04]'
                    : 'border-white/[0.04] bg-white/[0.02] hover:bg-white/[0.03]'
                }`}
              >
                {/* Top 3 left accent */}
                {i < 3 && (
                  <div className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full" style={{ backgroundColor: RANK_MEDAL_COLORS[i] }} />
                )}

                {/* Rank number */}
                <div className="w-8 text-center shrink-0">
                  {i < 3 ? (
                    <motion.div
                      animate={i === 0 ? { scale: [1, 1.1, 1] } : undefined}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {i === 0 ? <Crown size={22} style={{ color: RANK_MEDAL_COLORS[0] }} /> :
                       i === 1 ? <Medal size={20} style={{ color: RANK_MEDAL_COLORS[1] }} /> :
                       <Award size={20} style={{ color: RANK_MEDAL_COLORS[2] }} />}
                    </motion.div>
                  ) : (
                    <span className="text-sm text-muted-foreground font-mono">#{g.rank}</span>
                  )}
                </div>

                {/* Guild emblem placeholder */}
                <div
                  className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    background: `${TIER_CONFIG[g.tier].color}15`,
                    border: `1px solid ${TIER_CONFIG[g.tier].color}33`
                  }}
                >
                  <Shield size={18} style={{ color: TIER_CONFIG[g.tier].color }} strokeWidth={1.5} />
                </div>

                {/* Name + Tier */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`font-display tracking-wider truncate ${i < 3 ? 'text-base' : 'text-sm'}`}>{g.name}</span>
                    <TierBadge tier={g.tier} size="sm" showLabel={false} />
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-0.5">
                    <span>{g.members} üye</span>
                    <span className="flex items-center gap-0.5"><Flame size={10} /> {g.heat}</span>
                  </div>
                </div>

                {/* Score */}
                <div className="text-right shrink-0">
                  <div className="font-display text-lg tracking-wider" style={{ color: i < 3 ? RANK_MEDAL_COLORS[i] : undefined }}>
                    {g.sp.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-muted-foreground">SP</div>
                </div>

                {/* Change indicator */}
                <div className="w-6 shrink-0 flex justify-center">
                  {g.change === 'up' && <ChevronUp size={16} className="text-emerald-500" />}
                  {g.change === 'down' && <ChevronDown size={16} className="text-red-500" />}
                  {g.change === 'same' && <Minus size={14} className="text-muted-foreground/40" />}
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="personal"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-2"
          >
            {MOCK_PERSONAL_RANKINGS.map((p, i) => {
              const rankConfig = RANK_CONFIG[p.personalRank];
              return (
                <motion.div
                  key={p.rank}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.4 }}
                  whileHover={{ x: 4, transition: { duration: 0.15 } }}
                  className={`relative flex items-center gap-4 px-5 py-4 rounded-xl border cursor-pointer ${
                    i < 3
                      ? 'border-white/[0.1] bg-white/[0.04]'
                      : 'border-white/[0.04] bg-white/[0.02] hover:bg-white/[0.03]'
                  }`}
                >
                  {i < 3 && (
                    <div className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full" style={{ backgroundColor: RANK_MEDAL_COLORS[i] }} />
                  )}

                  {/* Rank */}
                  <div className="w-8 text-center shrink-0">
                    {i < 3 ? (
                      <motion.div animate={i === 0 ? { scale: [1, 1.1, 1] } : undefined} transition={{ duration: 2, repeat: Infinity }}>
                        {i === 0 ? <Crown size={22} style={{ color: RANK_MEDAL_COLORS[0] }} /> :
                         i === 1 ? <Medal size={20} style={{ color: RANK_MEDAL_COLORS[1] }} /> :
                         <Award size={20} style={{ color: RANK_MEDAL_COLORS[2] }} />}
                      </motion.div>
                    ) : (
                      <span className="text-sm text-muted-foreground font-mono">#{p.rank}</span>
                    )}
                  </div>

                  {/* Avatar placeholder */}
                  <div className="h-10 w-10 rounded-full bg-white/[0.06] flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-muted-foreground">{p.name.split(' ').map(n => n[0]).join('')}</span>
                  </div>

                  {/* Name + Guild */}
                  <div className="flex-1 min-w-0">
                    <span className={`font-medium truncate block ${i < 3 ? 'text-base' : 'text-sm'}`}>{p.name}</span>
                    <span className="text-[11px] text-muted-foreground">{p.guild}</span>
                  </div>

                  {/* Rank badge */}
                  <div
                    className="px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0"
                    style={{ backgroundColor: rankConfig.color + '20', color: rankConfig.color, border: `1px solid ${rankConfig.color}33` }}
                  >
                    {rankConfig.label}
                  </div>

                  {/* Score */}
                  <div className="text-right shrink-0">
                    <div className="font-display text-lg tracking-wider" style={{ color: i < 3 ? RANK_MEDAL_COLORS[i] : undefined }}>
                      {p.score.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-muted-foreground">puan</div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}