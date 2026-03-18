import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flame, Users, Trophy, Swords, Settings, Clock, Target,
  UserPlus, TrendingUp, Zap, Shield, Crown, ChevronRight,
  Coins, Calendar, Award, ArrowRight, Activity, Loader2,
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
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// ============================================
// Helper Components
// ============================================

interface ActivityItem {
  id: string;
  type: 'join' | 'quest' | 'heat' | 'promote' | 'challenge' | 'achievement';
  text: string;
  timestamp: string;
}

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
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const } },
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
  const { user } = useAuth();
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [guild, setGuild] = useState<Guild | null>(null);
  const [userRole, setUserRole] = useState<GuildRole>('raw');
  const [members, setMembers] = useState<GuildMember[]>([]);
  const [quests, setQuests] = useState<GuildQuest[]>([]);
  const [challenge, setChallenge] = useState<GuildChallenge | null>(null);
  const [activity] = useState<ActivityItem[]>([]); // Static empty for now

  useEffect(() => {
    if (!user || !slug) {
      setLoading(false);
      return;
    }

    const fetchDashboard = async () => {
      try {
        setLoading(true);

        // 1. Fetch guild by slug
        const { data: guildRow, error: guildError } = await supabase
          .from('guilds')
          .select('*')
          .eq('slug', slug)
          .single();

        if (guildError) throw guildError;

        if (!guildRow) {
          setGuild(null);
          setLoading(false);
          return;
        }

        const guildData = guildRow as unknown as Guild;
        setGuild(guildData);
        const guildId = guildData.id;

        // 2. Get user's membership to determine role/permissions
        const { data: membershipData } = await supabase
          .from('guild_members')
          .select('role')
          .eq('guild_id', guildId)
          .eq('user_id', user.id)
          .eq('is_active', true)
          .maybeSingle();

        if (membershipData) {
          setUserRole(membershipData.role as GuildRole);
        }

        // 2. Fetch members, quests, challenges in parallel
        const [membersRes, questsRes, challengesRes] = await Promise.all([
          supabase
            .from('guild_members')
            .select('*, profiles(full_name, avatar_url, streak, current_phase, current_week)')
            .eq('guild_id', guildId)
            .eq('is_active', true),
          supabase
            .from('guild_quests')
            .select('*')
            .eq('guild_id', guildId)
            .eq('status', 'active'),
          supabase
            .from('guild_challenges')
            .select('*, challenger:guilds!challenger_id(*), challenged:guilds!challenged_id(*)')
            .or(`challenger_id.eq.${guildId},challenged_id.eq.${guildId}`)
            .eq('status', 'live')
            .limit(1),
        ]);

        if (membersRes.error) throw membersRes.error;
        if (questsRes.error) throw questsRes.error;
        if (challengesRes.error) throw challengesRes.error;

        const sortedMembers = ((membersRes.data || []) as unknown as GuildMember[]).sort(
          (a, b) => GUILD_ROLE_ORDER[b.role] - GUILD_ROLE_ORDER[a.role]
        );
        setMembers(sortedMembers);
        setQuests((questsRes.data || []) as unknown as GuildQuest[]);
        setChallenge(((challengesRes.data || [])[0] as unknown as GuildChallenge) || null);
      } catch (err: any) {
        console.error('Error fetching guild dashboard:', err);
        toast({ title: 'Hata', description: 'Lonca verileri yüklenirken bir hata oluştu.', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [user, slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 size={32} className="text-primary animate-spin" />
          <p className="text-muted-foreground text-sm">Lonca yükleniyor...</p>
        </motion.div>
      </div>
    );
  }

  // No guild state
  if (!guild) {
    return (
      <div className="min-h-screen flex items-center justify-center pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-md"
        >
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="mb-6"
          >
            <Shield size={64} className="mx-auto text-muted-foreground/30" strokeWidth={1} />
          </motion.div>
          <h2 className="font-display text-2xl tracking-wider text-foreground mb-3">
            Henüz bir loncaya katılmadın
          </h2>
          <p className="text-muted-foreground text-sm mb-8">
            Bir lonca bul veya kendi loncanı kur. Birlikte daha güçlüsünüz.
          </p>
          <div className="flex items-center justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/guilds')}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary/10 border border-primary/30 text-primary font-semibold text-sm hover:bg-primary/20 transition-colors"
            >
              <Users size={18} />
              Loncaları Keşfet
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/guilds/create')}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-foreground font-semibold text-sm hover:bg-white/[0.06] transition-colors"
            >
              <Flame size={18} />
              Lonca Kur
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  const tierConfig = TIER_CONFIG[guild.tier];
  const levelConfig = LEVEL_CONFIG[guild.level] || LEVEL_CONFIG[1];
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
                        onClick={() => navigate(`/guilds/${slug}/manage`)}
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

          {quests.length === 0 ? (
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-8 text-center">
              <Target size={32} className="mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground text-sm">Aktif görev bulunmuyor.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {quests.map((quest, i) => {
                const typeConfig = QUEST_TYPE_COLORS[quest.quest_type] || QUEST_TYPE_COLORS.weekly;
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
          )}
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
              {members.length} / {guild.max_members}
            </span>
          </div>

          <div className="relative rounded-xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl overflow-hidden">
            {/* Top accent */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {members.length === 0 ? (
              <div className="p-8 text-center">
                <Users size={32} className="mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground text-sm">Henüz üye bulunmuyor.</p>
              </div>
            ) : (
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
            )}
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

              {activity.length === 0 ? (
                <div className="p-8 text-center">
                  <Activity size={32} className="mx-auto text-muted-foreground/30 mb-3" />
                  <p className="text-muted-foreground text-sm">Henüz aktivite bulunmuyor.</p>
                </div>
              ) : (
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
              )}
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

            {!challenge ? (
              <div className="relative rounded-xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl overflow-hidden p-8 text-center">
                <Swords size={32} className="mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground text-sm">Aktif challenge bulunmuyor.</p>
              </div>
            ) : (
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
                      {challenge.challenge_type.replace('_', ' ')}
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
                    {/* Challenger */}
                    <div className="flex-1 text-center">
                      <div
                        className="h-14 w-14 mx-auto rounded-xl flex items-center justify-center mb-2"
                        style={{
                          background: challenge.challenger ? `linear-gradient(135deg, ${TIER_CONFIG[challenge.challenger.tier].color}22, ${TIER_CONFIG[challenge.challenger.tier].color}44)` : 'rgba(255,255,255,0.06)',
                          border: challenge.challenger ? `1px solid ${TIER_CONFIG[challenge.challenger.tier].color}44` : '1px solid rgba(255,255,255,0.1)',
                        }}
                      >
                        <Shield size={24} style={{ color: challenge.challenger ? TIER_CONFIG[challenge.challenger.tier].color : '#888' }} />
                      </div>
                      <p className="text-xs font-semibold text-foreground truncate">{challenge.challenger?.name || '?'}</p>
                      <motion.p
                        className="font-display text-2xl mt-1"
                        style={{ color: challenge.challenger ? TIER_CONFIG[challenge.challenger.tier].color : undefined }}
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

                    {/* Challenged */}
                    <div className="flex-1 text-center">
                      <div
                        className="h-14 w-14 mx-auto rounded-xl flex items-center justify-center mb-2"
                        style={{
                          background: challenge.challenged ? `linear-gradient(135deg, ${TIER_CONFIG[challenge.challenged.tier].color}22, ${TIER_CONFIG[challenge.challenged.tier].color}44)` : 'rgba(255,255,255,0.06)',
                          border: challenge.challenged ? `1px solid ${TIER_CONFIG[challenge.challenged.tier].color}44` : '1px solid rgba(255,255,255,0.1)',
                        }}
                      >
                        <Swords size={24} style={{ color: challenge.challenged ? TIER_CONFIG[challenge.challenged.tier].color : '#888' }} />
                      </div>
                      <p className="text-xs font-semibold text-foreground truncate">{challenge.challenged?.name || '?'}</p>
                      <p
                        className="font-display text-2xl mt-1"
                        style={{ color: challenge.challenged ? TIER_CONFIG[challenge.challenged.tier].color : undefined }}
                      >
                        {challenge.challenged_score.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Score difference bar */}
                  {(challenge.challenger_score + challenge.challenged_score) > 0 && (
                    <div className="mb-4">
                      <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden flex">
                        <motion.div
                          className="h-full rounded-l-full"
                          style={{
                            background: challenge.challenger ? TIER_CONFIG[challenge.challenger.tier].color : '#888',
                            boxShadow: challenge.challenger ? `0 0 10px ${TIER_CONFIG[challenge.challenger.tier].glow}` : undefined,
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
                            background: challenge.challenged ? TIER_CONFIG[challenge.challenged.tier].color : '#888',
                            boxShadow: challenge.challenged ? `0 0 10px ${TIER_CONFIG[challenge.challenged.tier].glow}` : undefined,
                          }}
                          initial={{ width: 0 }}
                          animate={{
                            width: `${(challenge.challenged_score / (challenge.challenger_score + challenge.challenged_score)) * 100}%`,
                          }}
                          transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Time remaining */}
                  {challenge.ends_at && (
                    <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                      <Clock size={12} />
                      <span>{getTimeRemaining(challenge.ends_at)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
