import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Users, User, Flame, TrendingUp, TrendingDown, Minus, Crown, Medal, Award, ChevronUp, ChevronDown, Shield, Loader2 } from "lucide-react";
import { TIER_CONFIG, RANK_CONFIG, type GuildTier, type PersonalRank, type Guild, getPersonalRank } from "@/types/guild";
import TierBadge from "@/components/guild/TierBadge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface GuildRanking {
  rank: number;
  name: string;
  tier: GuildTier;
  sp: number;
  heat: number;
  members: number;
  change: 'up' | 'down' | 'same';
}

interface PersonalRanking {
  rank: number;
  name: string;
  score: number;
  personalRank: PersonalRank;
  guild: string;
}

const RANK_MEDAL_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32'];

export default function Rankings() {
  const [tab, setTab] = useState<'guild' | 'personal'>('guild');
  const [guildRankings, setGuildRankings] = useState<GuildRanking[]>([]);
  const [personalRankings, setPersonalRankings] = useState<PersonalRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [guildsRes, profilesRes] = await Promise.all([
          supabase
            .from('guilds')
            .select('*')
            .eq('is_active', true)
            .order('season_points', { ascending: false }),
          supabase
            .from('profiles')
            .select('*, user_roles(role)')
            .order('streak', { ascending: false })
            .limit(50),
        ]);

        if (guildsRes.error) throw guildsRes.error;
        if (profilesRes.error) throw profilesRes.error;

        const guilds = (guildsRes.data || []) as unknown as Guild[];
        setGuildRankings(
          guilds.map((g, i) => ({
            rank: i + 1,
            name: g.name,
            tier: g.tier,
            sp: g.season_points,
            heat: g.heat_level,
            members: g.member_count,
            change: 'same' as const,
          }))
        );

        const profiles = profilesRes.data || [];
        setPersonalRankings(
          profiles.map((p: any, i: number) => ({
            rank: i + 1,
            name: p.full_name || 'Anonim',
            score: p.streak || 0,
            personalRank: getPersonalRank(p.streak || 0),
            guild: '-',
          }))
        );
      } catch (err: any) {
        console.error('Error fetching rankings:', err);
        toast({ title: 'Hata', description: 'Sıralama verileri yüklenirken bir hata oluştu.', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 size={32} className="text-primary animate-spin" />
          <p className="text-muted-foreground text-sm">Sıralama yükleniyor...</p>
        </motion.div>
      </div>
    );
  }

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
            {guildRankings.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
                <Trophy size={48} className="mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">Henüz sıralamada lonca yok.</p>
              </motion.div>
            ) : (
              guildRankings.map((g, i) => (
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
              ))
            )}
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
            {personalRankings.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
                <User size={48} className="mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">Henüz bireysel sıralamada kimse yok.</p>
              </motion.div>
            ) : (
              personalRankings.map((p, i) => {
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
                      <div className="text-[10px] text-muted-foreground">streak</div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
