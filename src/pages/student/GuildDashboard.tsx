import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flame, Users, Trophy, Swords, Settings, Clock, Target,
  UserPlus, TrendingUp, Zap, Shield, Crown, ChevronRight,
  Coins, Calendar, Award, ArrowRight, Activity,
} from "lucide-react";
import {
  type Guild,
  type GuildMember,
  type GuildQuest,
  type GuildChallenge,
  type GuildRole,
  TIER_CONFIG,
  GUILD_ROLE_ORDER,
  LEVEL_CONFIG,
  RANK_CONFIG,
  getPersonalRank,
  getHeatLabel,
} from "@/types/guild";
import TierBadge from "@/components/guild/TierBadge";
import HeatMeter from "@/components/guild/HeatMeter";
import RoleBadge from "@/components/guild/RoleBadge";

// ============================================
// Mock Data
// ============================================

const MOCK_GUILD: Guild = {
  id: '1',
  name: 'IRON WOLVES',
  slug: 'iron-wolves',
  motto: 'Sürüden ayrılan kurdu kış yer',
  description: 'Elite lonca. Sadece en disiplinliler kabul edilir.',
  emblem_url: null,
  emblem_config: { symbol: 'wolf', colors: ['#FF4500', '#FFD700'] },
  guild_type: 'application',
  rules: [],
  level: 7,
  total_points: 22000,
  season_points: 4800,
  treasury_points: 1200,
  heat_level: 92,
  tier: 'diamond',
  max_members: 50,
  member_count: 38,
  min_streak_requirement: 7,
  min_phase_requirement: 2,
  min_score_requirement: 3000,
  founder_id: 'u1',
  is_active: true,
  created_at: '2025-09-15T10:00:00Z',
  updated_at: '2026-03-17T08:00:00Z',
};

const MOCK_MEMBERS: (GuildMember & { personalRank: string })[] = [
  {
    id: 'm1', guild_id: '1', user_id: 'u1', role: 'blacksmith',
    joined_at: '2025-09-15T10:00:00Z', promoted_at: null, contribution_points: 8400,
    is_active: true, personalRank: 'silver',
    profile: { full_name: 'Kaan Yılmaz', avatar_url: null, streak: 42, current_phase: 3, current_week: 2 },
  },
  {
    id: 'm2', guild_id: '1', user_id: 'u2', role: 'striker',
    joined_at: '2025-09-20T10:00:00Z', promoted_at: '2026-01-10T10:00:00Z', contribution_points: 6200,
    is_active: true, personalRank: 'silver',
    profile: { full_name: 'Elif Demir', avatar_url: null, streak: 38, current_phase: 3, current_week: 1 },
  },
  {
    id: 'm3', guild_id: '1', user_id: 'u3', role: 'tempered',
    joined_at: '2025-10-05T10:00:00Z', promoted_at: '2025-12-15T10:00:00Z', contribution_points: 4100,
    is_active: true, personalRank: 'bronze',
    profile: { full_name: 'Ahmet Korkmaz', avatar_url: null, streak: 28, current_phase: 2, current_week: 4 },
  },
  {
    id: 'm4', guild_id: '1', user_id: 'u4', role: 'tempered',
    joined_at: '2025-10-12T10:00:00Z', promoted_at: '2026-01-20T10:00:00Z', contribution_points: 3800,
    is_active: true, personalRank: 'bronze',
    profile: { full_name: 'Zeynep Aksoy', avatar_url: null, streak: 24, current_phase: 2, current_week: 3 },
  },
  {
    id: 'm5', guild_id: '1', user_id: 'u5', role: 'heated',
    joined_at: '2025-11-01T10:00:00Z', promoted_at: '2026-02-10T10:00:00Z', contribution_points: 2200,
    is_active: true, personalRank: 'steel',
    profile: { full_name: 'Burak Yıldız', avatar_url: null, streak: 15, current_phase: 2, current_week: 1 },
  },
  {
    id: 'm6', guild_id: '1', user_id: 'u6', role: 'heated',
    joined_at: '2025-12-10T10:00:00Z', promoted_at: null, contribution_points: 1800,
    is_active: true, personalRank: 'steel',
    profile: { full_name: 'Selin Kaya', avatar_url: null, streak: 12, current_phase: 1, current_week: 6 },
  },
  {
    id: 'm7', guild_id: '1', user_id: 'u7', role: 'raw',
    joined_at: '2026-02-20T10:00:00Z', promoted_at: null, contribution_points: 600,
    is_active: true, personalRank: 'iron',
    profile: { full_name: 'Deniz Aslan', avatar_url: null, streak: 8, current_phase: 1, current_week: 3 },
  },
  {
    id: 'm8', guild_id: '1', user_id: 'u8', role: 'raw',
    joined_at: '2026-03-05T10:00:00Z', promoted_at: null, contribution_points: 240,
    is_active: true, personalRank: 'ore',
    profile: { full_name: 'Can Tekin', avatar_url: null, streak: 4, current_phase: 1, current_week: 1 },
  },
];

const MOCK_QUESTS: GuildQuest[] = [
  {
    id: 'q1', guild_id: '1', created_by: 'u1',
    title: '7 Gün Kesintisiz Check-in', description: 'Tüm üyeler 7 gün boyunca check-in yapsın',
    quest_type: 'weekly', target_value: 38, current_value: 29,
    points_reward: 500, starts_at: '2026-03-14T00:00:00Z', ends_at: '2026-03-21T00:00:00Z',
    status: 'active', completion_rate: 76, created_at: '2026-03-14T00:00:00Z',
  },
  {
    id: 'q2', guild_id: '1', created_by: 'u2',
    title: 'Sprint: 100 Görev Tamamla', description: 'Lonca genelinde 100 görev bitirilsin',
    quest_type: 'sprint', target_value: 100, current_value: 67,
    points_reward: 1200, starts_at: '2026-03-10T00:00:00Z', ends_at: '2026-03-24T00:00:00Z',
    status: 'active', completion_rate: 67, created_at: '2026-03-10T00:00:00Z',
  },
  {
    id: 'q3', guild_id: '1', created_by: 'u1',
    title: 'Brotherhood: Yeni Üye Mentorla', description: '3 Raw üyeye mentor ata',
    quest_type: 'brotherhood', target_value: 3, current_value: 2,
    points_reward: 800, starts_at: '2026-03-01T00:00:00Z', ends_at: '2026-03-31T00:00:00Z',
    status: 'active', completion_rate: 66, created_at: '2026-03-01T00:00:00Z',
  },
];

const MOCK_CHALLENGE: GuildChallenge = {
  id: 'ch1',
  challenger_id: '1',
  challenged_id: '2',
  challenge_type: 'heat_wave',
  challenger_score: 4800,
  challenged_score: 4200,
  winner_id: null,
  status: 'live',
  starts_at: '2026-03-15T00:00:00Z',
  ends_at: '2026-03-22T00:00:00Z',
  created_at: '2026-03-14T00:00:00Z',
  challenger: MOCK_GUILD,
  challenged: {
    id: '2', name: 'OBSIDIAN FORGE', slug: 'obsidian-forge', motto: 'Ateşten geçmeyen çelik olmaz',
    description: null, emblem_url: null, emblem_config: {}, guild_type: 'invite',
    rules: [], level: 9, total_points: 65000, season_points: 11200, treasury_points: 3400,
    heat_level: 98, tier: 'obsidian', max_members: 100, member_count: 87,
    min_streak_requirement: 14, min_phase_requirement: 2, min_score_requirement: 5000,
    founder_id: '', is_active: true, created_at: '', updated_at: '',
  },
};

interface ActivityItem {
  id: string;
  type: 'join' | 'quest' | 'heat' | 'promote' | 'challenge' | 'achievement';
  text: string;
  timestamp: string;
}

const MOCK_ACTIVITY: ActivityItem[] = [
  { id: 'a1', type: 'join', text: 'Can Tekin loncaya katıldı', timestamp: '2 saat önce' },
  { id: 'a2', type: 'quest', text: '"7 Gün Check-in" görevinde 29/38 tamamlandı', timestamp: '4 saat önce' },
  { id: 'a3', type: 'heat', text: 'Heat level +8 yükseldi — artık 92', timestamp: '6 saat önce' },
  { id: 'a4', type: 'promote', text: 'Selin Kaya "Heated" rolüne terfi etti', timestamp: '1 gün önce' },
  { id: 'a5', type: 'challenge', text: 'OBSIDIAN FORGE ile Heat Wave challenge başladı', timestamp: '3 gün önce' },
  { id: 'a6', type: 'achievement', text: 'Sprint quest %50 hedefini geçti', timestamp: '4 gün önce' },
  { id: 'a7', type: 'join', text: 'Deniz Aslan loncaya katıldı', timestamp: '5 gün önce' },
  { id: 'a8', type: 'quest', text: '"Brotherhood Mentor" görevinde 2/3 tamamlandı', timestamp: '1 hafta önce' },
];

// ============================================
// Helper Components
// ============================================

const ACTIVITY_ICONS: Record<ActivityItem['type'], React.ElementType> = {
  join: UserPlus,
  quest: Target,
  heat: Flame,
  promote: TrendingUp,
  challenge: Swords,
  achievement: Award,
};

const ACTIVITY_COLORS: Record<ActivityItem['type'], string> = {
  join: '#22C55E',
  quest: '#3B82F6',
  heat: '#FF8C00',
  promote: '#A855F7',
  challenge: '#EF4444',
  achievement: '#FFD700',
};

const QUEST_TYPE_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  weekly: { bg: 'rgba(59,130,246,0.15)', text: '#3B82F6', label: 'Haftalık' },
  sprint: { bg: 'rgba(255,69,0,0.15)', text: '#FF4500', label: 'Sprint' },
  brotherhood: { bg: 'rgba(168,85,247,0.15)', text: '#A855F7', label: 'Brotherhood' },
  challenge: { bg: 'rgba(239,68,68,0.15)', text: '#EF4444', label: 'Challenge' },
  external: { bg: 'rgba(34,197,94,0.15)', text: '#22C55E', label: 'Harici' },
};

// Stagger animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getTimeRemaining(endDate: string): string {
  const now = new Date();
  const end = new Date(endDate);
  const diff = end.getTime() - now.getTime();
  if (diff <= 0) return 'Süre doldu';
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 0) return `${days}g ${hours}s kaldı`;
  return `${hours}s kaldı`;
}

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

// ============================================
// Main Component
// ============================================

export default function GuildDashboard() {
  const guild = MOCK_GUILD;
  const members = [...MOCK_MEMBERS].sort(
    (a, b) => GUILD_ROLE_ORDER[b.role] - GUILD_ROLE_ORDER[a.role]
  );
  const quests = MOCK_QUESTS;
  const challenge = MOCK_CHALLENGE;
  const activity = MOCK_ACTIVITY;

  const tierConfig = TIER_CONFIG[guild.tier];
  const levelConfig = LEVEL_CONFIG[guild.level];
  const userRole: GuildRole = 'blacksmith'; // Mock: current user is blacksmith
  const canManage = userRole === 'blacksmith' || userRole === 'striker';

  return (
    <div className="min-h-screen pb-20">
      {/* Background glow orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div
          className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full blur-[160px] opacity-30"
          style={{ background: tierConfig.color }}
        />
        <div className="absolute top-40 right-1/5 w-80 h-80 bg-amber-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-40 left-1/3 w-64 h-64 bg-primary/5 rounded-full blur-[100px]" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* =========================================
            SECTION 1: Guild Header Hero Card
        ========================================= */}
        <motion.div variants={itemVariants}>
          <div className="relative rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl overflow-hidden">
            {/* Top accent line */}
            <motion.div
              className="absolute top-0 left-0 right-0 h-[2px]"
              style={{ background: `linear-gradient(90deg, transparent, ${tierConfig.color}, ${tierConfig.color}88, transparent)` }}
              animate={{ backgroundPosition: ['0% 0%', '200% 0%'] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            />

            {/* Inner glow */}
            <div
              className="absolute top-0 left-0 right-0 h-40 opacity-10 pointer-events-none"
              style={{ background: `linear-gradient(180deg, ${tierConfig.color}, transparent)` }}
            />

            <div className="relative p-6 md:p-8">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                {/* Emblem */}
                <motion.div
                  className="h-24 w-24 md:h-28 md:w-28 rounded-2xl flex items-center justify-center shrink-0 relative"
                  style={{
                    background: `linear-gradient(135deg, ${tierConfig.color}22, ${tierConfig.color}44)`,
                    border: `2px solid ${tierConfig.color}44`,
                  }}
                  whileHover={{ scale: 1.05, rotate: 2 }}
                >
                  <motion.div
                    className="absolute inset-0 rounded-2xl"
                    animate={{
                      boxShadow: [
                        `0 0 0px ${tierConfig.color}00`,
                        `0 0 40px ${tierConfig.glow}`,
                        `0 0 0px ${tierConfig.color}00`,
                      ],
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                  <Shield size={48} style={{ color: tierConfig.color }} strokeWidth={1.5} />
                </motion.div>

                {/* Guild Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap mb-1">
                    <h1 className="font-display text-3xl md:text-4xl tracking-wider text-foreground">
                      {guild.name}
                    </h1>
                    {canManage && (
                      <motion.button
                        whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.08)' }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Settings size={14} />
                        Yönet
                      </motion.button>
                    )}
                  </div>

                  <p className="text-muted-foreground text-sm italic mb-4">
                    "{guild.motto}"
                  </p>

                  <div className="flex items-center gap-4 flex-wrap">
                    <TierBadge tier={guild.tier} size="md" />
                    <div className="flex items-center gap-1.5 text-sm">
                      <Zap size={14} style={{ color: tierConfig.color }} />
                      <span className="text-muted-foreground">Lv.</span>
                      <span className="font-semibold text-foreground">{guild.level}</span>
                      <span className="text-muted-foreground text-xs">({levelConfig.name})</span>
                    </div>
                    <HeatMeter level={guild.heat_level} size="sm" />
                    <div className="flex items-center gap-1.5 text-sm">
                      <Users size={14} className="text-muted-foreground" />
                      <span className="font-semibold text-foreground">{guild.member_count}</span>
                      <span className="text-muted-foreground">/ {guild.max_members}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm">
                      <Trophy size={14} className="text-amber-400" />
                      <span className="font-semibold text-foreground">{guild.season_points.toLocaleString()}</span>
                      <span className="text-muted-foreground">SP</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* =========================================
            SECTION 2: Quick Stats Row
        ========================================= */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-2 md:grid-cols-4 gap-3"
        >
          {[
            {
              label: 'Üye Sayısı',
              value: `${guild.member_count}`,
              sub: `/ ${guild.max_members} max`,
              icon: Users,
              color: '#3B82F6',
            },
            {
              label: 'Heat Level',
              value: `${guild.heat_level}`,
              sub: getHeatLabel(guild.heat_level).label,
              icon: Flame,
              color: getHeatLabel(guild.heat_level).color,
            },
            {
              label: 'Sezon Puanı',
              value: guild.season_points.toLocaleString(),
              sub: 'bu sezon',
              icon: Trophy,
              color: '#FFD700',
            },
            {
              label: 'Vault',
              value: guild.treasury_points.toLocaleString(),
              sub: 'hazine puanı',
              icon: Coins,
              color: '#22C55E',
            },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              className="relative rounded-xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl p-4 overflow-hidden group"
              whileHover={{ scale: 1.02, borderColor: stat.color + '33' }}
              transition={{ duration: 0.2 }}
            >
              {/* Top accent */}
              <div
                className="absolute top-0 left-0 right-0 h-[1px] opacity-40"
                style={{ background: `linear-gradient(90deg, transparent, ${stat.color}, transparent)` }}
              />

              <div className="flex items-start justify-between mb-2">
                <span className="text-xs text-muted-foreground">{stat.label}</span>
                <motion.div
                  className="p-1.5 rounded-lg"
                  style={{ background: stat.color + '15' }}
                  whileHover={{ scale: 1.1 }}
                >
                  <stat.icon size={14} style={{ color: stat.color }} />
                </motion.div>
              </div>
              <div className="font-display text-2xl tracking-wide text-foreground mb-0.5">
                {stat.value}
              </div>
              <div className="text-xs text-muted-foreground">{stat.sub}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* =========================================
            SECTION 3: Active Quests
        ========================================= */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Target size={18} className="text-primary" />
              <h2 className="font-display text-lg tracking-wider text-foreground">AKTİF GÖREVLER</h2>
            </div>
            <span className="text-xs text-muted-foreground">{quests.length} aktif</span>
          </div>

          <div className="space-y-3">
            {quests.map((quest, i) => {
              const typeConfig = QUEST_TYPE_COLORS[quest.quest_type];
              const progress = quest.target_value
                ? Math.min((quest.current_value / quest.target_value) * 100, 100)
                : quest.completion_rate;

              return (
                <motion.div
                  key={quest.id}
                  className="relative rounded-xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl p-4 overflow-hidden group"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i, duration: 0.4 }}
                  whileHover={{ borderColor: 'rgba(255,255,255,0.12)', x: 4 }}
                >
                  {/* Top accent */}
                  <div
                    className="absolute top-0 left-0 right-0 h-[1px]"
                    style={{ background: `linear-gradient(90deg, transparent, ${typeConfig.text}66, transparent)` }}
                  />

                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="text-sm font-semibold text-foreground">{quest.title}</h3>
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                          style={{ background: typeConfig.bg, color: typeConfig.text }}
                        >
                          {typeConfig.label}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{quest.description}</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs shrink-0 ml-3">
                      <Trophy size={12} className="text-amber-400" />
                      <span className="font-semibold text-amber-400">{quest.points_reward}</span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mb-2">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">
                        {quest.current_value}/{quest.target_value}
                      </span>
                      <span className="font-medium" style={{ color: typeConfig.text }}>
                        {Math.round(progress)}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{
                          background: `linear-gradient(90deg, ${typeConfig.text}88, ${typeConfig.text})`,
                          boxShadow: `0 0 12px ${typeConfig.text}44`,
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, delay: 0.2 + i * 0.1, ease: "easeOut" }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock size={11} />
                      <span>{getTimeRemaining(quest.ends_at)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users size={11} />
                      <span>{guild.member_count} katılımcı</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* =========================================
            SECTION 4: Members List
        ========================================= */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-primary" />
              <h2 className="font-display text-lg tracking-wider text-foreground">ÜYELER</h2>
            </div>
            <span className="text-xs text-muted-foreground">
              {guild.member_count} / {guild.max_members}
            </span>
          </div>

          <div className="relative rounded-xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl overflow-hidden">
            {/* Top accent */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            <div className="divide-y divide-white/[0.04]">
              {members.map((member, i) => {
                const rank = getPersonalRank(member.contribution_points);
                const rankConfig = RANK_CONFIG[rank];

                return (
                  <motion.div
                    key={member.id}
                    className="flex items-center gap-3 p-3 md:p-4 hover:bg-white/[0.02] transition-colors group"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * i, duration: 0.3 }}
                  >
                    {/* Rank Number */}
                    <span className="text-xs text-muted-foreground w-5 text-center shrink-0">
                      {i + 1}
                    </span>

                    {/* Avatar */}
                    <div
                      className="h-10 w-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                      style={{
                        background: `linear-gradient(135deg, ${rankConfig.color}33, ${rankConfig.color}55)`,
                        border: `1px solid ${rankConfig.color}44`,
                        color: rankConfig.color,
                      }}
                    >
                      {getInitials(member.profile?.full_name || '??')}
                    </div>

                    {/* Name & Role */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-foreground truncate">
                          {member.profile?.full_name}
                        </span>
                        <RoleBadge role={member.role} size="sm" />
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-[10px] text-muted-foreground">
                          {formatDate(member.joined_at)}
                        </span>
                      </div>
                    </div>

                    {/* Contribution */}
                    <div className="text-right shrink-0 hidden md:block">
                      <div className="text-sm font-semibold text-foreground">
                        {member.contribution_points.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-muted-foreground">katkı</div>
                    </div>

                    {/* Personal Rank */}
                    <div
                      className="px-2 py-1 rounded-md text-[10px] font-bold shrink-0"
                      style={{
                        background: rankConfig.color + '18',
                        color: rankConfig.color,
                        border: `1px solid ${rankConfig.color}30`,
                      }}
                    >
                      {rankConfig.label}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Bottom row: Activity Feed + Challenge */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* =========================================
              SECTION 5: Recent Activity Feed
          ========================================= */}
          <motion.div variants={itemVariants} className="lg:col-span-3">
            <div className="flex items-center gap-2 mb-4">
              <Activity size={18} className="text-primary" />
              <h2 className="font-display text-lg tracking-wider text-foreground">SON AKTİVİTE</h2>
            </div>

            <div className="relative rounded-xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl overflow-hidden">
              {/* Top accent */}
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

              <div className="divide-y divide-white/[0.04]">
                {activity.map((item, i) => {
                  const Icon = ACTIVITY_ICONS[item.type];
                  const color = ACTIVITY_COLORS[item.type];

                  return (
                    <motion.div
                      key={item.id}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * i, duration: 0.3 }}
                    >
                      <div
                        className="h-8 w-8 rounded-full flex items-center justify-center shrink-0"
                        style={{ background: color + '18' }}
                      >
                        <Icon size={14} style={{ color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground truncate">{item.text}</p>
                      </div>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0">
                        {item.timestamp}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* =========================================
              SECTION 6: Active Challenge
          ========================================= */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Swords size={18} className="text-red-500" />
              <h2 className="font-display text-lg tracking-wider text-foreground">AKTİF CHALLENGE</h2>
            </div>

            <div className="relative rounded-xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl overflow-hidden">
              {/* Top accent - animated red */}
              <motion.div
                className="absolute top-0 left-0 right-0 h-[2px]"
                style={{ background: 'linear-gradient(90deg, transparent, #EF4444, #FF8C00, #EF4444, transparent)' }}
                animate={{ backgroundPosition: ['0% 0%', '200% 0%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />

              <div className="p-5">
                {/* Challenge type badge */}
                <div className="flex items-center justify-between mb-5">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-500/15 text-red-400 border border-red-500/20 uppercase tracking-wider">
                    Heat Wave
                  </span>
                  <motion.div
                    className="flex items-center gap-1 text-xs text-red-400"
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                    CANLI
                  </motion.div>
                </div>

                {/* VS Layout */}
                <div className="flex items-center gap-3 mb-5">
                  {/* Our Guild */}
                  <div className="flex-1 text-center">
                    <div
                      className="h-14 w-14 mx-auto rounded-xl flex items-center justify-center mb-2"
                      style={{
                        background: `linear-gradient(135deg, ${TIER_CONFIG[guild.tier].color}22, ${TIER_CONFIG[guild.tier].color}44)`,
                        border: `1px solid ${TIER_CONFIG[guild.tier].color}44`,
                      }}
                    >
                      <Shield size={24} style={{ color: TIER_CONFIG[guild.tier].color }} />
                    </div>
                    <p className="text-xs font-semibold text-foreground truncate">{challenge.challenger?.name}</p>
                    <motion.p
                      className="font-display text-2xl mt-1"
                      style={{ color: TIER_CONFIG[guild.tier].color }}
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {challenge.challenger_score.toLocaleString()}
                    </motion.p>
                  </div>

                  {/* VS Divider */}
                  <div className="flex flex-col items-center gap-1">
                    <motion.span
                      className="font-display text-xl text-muted-foreground"
                      animate={{ scale: [1, 1.15, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      VS
                    </motion.span>
                  </div>

                  {/* Opponent */}
                  <div className="flex-1 text-center">
                    <div
                      className="h-14 w-14 mx-auto rounded-xl flex items-center justify-center mb-2"
                      style={{
                        background: `linear-gradient(135deg, ${TIER_CONFIG[challenge.challenged!.tier].color}22, ${TIER_CONFIG[challenge.challenged!.tier].color}44)`,
                        border: `1px solid ${TIER_CONFIG[challenge.challenged!.tier].color}44`,
                      }}
                    >
                      <Swords size={24} style={{ color: TIER_CONFIG[challenge.challenged!.tier].color }} />
                    </div>
                    <p className="text-xs font-semibold text-foreground truncate">{challenge.challenged?.name}</p>
                    <p
                      className="font-display text-2xl mt-1"
                      style={{ color: TIER_CONFIG[challenge.challenged!.tier].color }}
                    >
                      {challenge.challenged_score.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Score difference bar */}
                <div className="mb-4">
                  <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden flex">
                    <motion.div
                      className="h-full rounded-l-full"
                      style={{
                        background: TIER_CONFIG[guild.tier].color,
                        boxShadow: `0 0 10px ${TIER_CONFIG[guild.tier].glow}`,
                      }}
                      initial={{ width: 0 }}
                      animate={{
                        width: `${(challenge.challenger_score / (challenge.challenger_score + challenge.challenged_score)) * 100}%`,
                      }}
                      transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                    />
                    <motion.div
                      className="h-full rounded-r-full"
                      style={{
                        background: TIER_CONFIG[challenge.challenged!.tier].color,
                        boxShadow: `0 0 10px ${TIER_CONFIG[challenge.challenged!.tier].glow}`,
                      }}
                      initial={{ width: 0 }}
                      animate={{
                        width: `${(challenge.challenged_score / (challenge.challenger_score + challenge.challenged_score)) * 100}%`,
                      }}
                      transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                    />
                  </div>
                </div>

                {/* Time remaining */}
                <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                  <Clock size={12} />
                  <span>{getTimeRemaining(challenge.ends_at!)}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
