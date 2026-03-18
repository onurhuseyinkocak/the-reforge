import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Flame, Users, Trophy, Swords, TrendingUp, Crown, Zap, ChevronRight, Loader2 } from "lucide-react";
import { type Guild, type GuildTier, TIER_CONFIG } from "@/types/guild";
import GuildCard from "@/components/guild/GuildCard";
import TierBadge from "@/components/guild/TierBadge";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const TIER_FILTERS: { value: GuildTier | 'all'; label: string; color: string }[] = [
  { value: 'all', label: 'Tümü', color: '#FF4500' },
  { value: 'obsidian', label: 'Obsidian', color: TIER_CONFIG.obsidian.color },
  { value: 'diamond', label: 'Diamond', color: TIER_CONFIG.diamond.color },
  { value: 'gold', label: 'Gold', color: TIER_CONFIG.gold.color },
  { value: 'silver', label: 'Silver', color: TIER_CONFIG.silver.color },
  { value: 'bronze', label: 'Bronze', color: TIER_CONFIG.bronze.color },
];

export default function Guilds() {
  const [search, setSearch] = useState("");
  const [activeTier, setActiveTier] = useState<GuildTier | 'all'>('all');
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchGuilds = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('guilds')
          .select('*')
          .eq('is_active', true)
          .order('season_points', { ascending: false });

        if (error) throw error;
        setGuilds((data as unknown as Guild[]) || []);
      } catch (err: any) {
        console.error('Error fetching guilds:', err);
        toast({ title: 'Hata', description: 'Loncalar yüklenirken bir hata oluştu.', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    fetchGuilds();
  }, []);

  const forgeOfWeek = guilds[0] || null;

  const filtered = useMemo(() => {
    return guilds
      .filter(g => activeTier === 'all' || g.tier === activeTier)
      .filter(g => !search || g.name.toLowerCase().includes(search.toLowerCase()) || g.motto?.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => b.season_points - a.season_points);
  }, [search, activeTier, guilds]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 size={32} className="text-primary animate-spin" />
          <p className="text-muted-foreground text-sm">Loncalar yükleniyor...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Hero */}
      <div className="relative overflow-hidden mb-8">
        {/* Background glow orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute top-20 right-1/4 w-64 h-64 bg-amber-500/5 rounded-full blur-[100px]" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative pt-2 pb-6"
        >
          <div className="flex items-end justify-between mb-6">
            <div>
              <motion.h1
                className="font-display text-5xl md:text-6xl tracking-wider text-foreground"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                LONCALAR
              </motion.h1>
              <motion.p
                className="text-muted-foreground mt-2 max-w-md"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                Tek başına bir kıvılcımsın. Loncanla bir yanardağsın.
              </motion.p>
            </div>

            {/* Create Guild CTA */}
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(255,69,0,0.3)' }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/guilds/create')}
              className="hidden md:flex items-center gap-2 px-6 py-3 rounded-xl bg-primary/10 border border-primary/30 text-primary font-semibold text-sm hover:bg-primary/20 transition-colors"
            >
              <Plus size={18} />
              Lonca Kur
            </motion.button>
          </div>

          {/* Stats bar */}
          <motion.div
            className="flex items-center gap-6 mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {[
              { icon: Users, label: 'Aktif Lonca', value: String(guilds.length) },
              { icon: Swords, label: 'Challenge', value: '-' },
              { icon: Trophy, label: 'Sezon', value: 'Kış Ateşi 2026' },
              { icon: Crown, label: 'Toplam Üye', value: String(guilds.reduce((sum, g) => sum + g.member_count, 0)) },
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <stat.icon size={14} className="text-muted-foreground" />
                <span className="text-muted-foreground">{stat.label}:</span>
                <span className="text-foreground font-medium">{stat.value}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Forge of the Week - Featured */}
      {forgeOfWeek && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Flame size={18} className="text-primary" />
            </motion.div>
            <h2 className="font-display text-lg tracking-wider text-foreground">HAFTANIN OCAĞI</h2>
          </div>

          <div className="relative rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/[0.06] via-transparent to-primary/[0.03] overflow-hidden">
            {/* Animated accent */}
            <motion.div
              className="absolute top-0 left-0 right-0 h-[2px]"
              style={{ background: 'linear-gradient(90deg, transparent, #FF4500, #FFD700, #FF4500, transparent)' }}
              animate={{ backgroundPosition: ['0% 0%', '200% 0%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />

            <div className="p-6 flex items-center gap-6">
              {/* Large emblem */}
              <div className="h-24 w-24 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0 relative">
                <motion.div
                  className="absolute inset-0 rounded-2xl"
                  animate={{ boxShadow: ['0 0 0px rgba(255,69,0,0)', '0 0 30px rgba(255,69,0,0.3)', '0 0 0px rgba(255,69,0,0)'] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
                <Crown size={40} className="text-primary" strokeWidth={1.5} />
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-display text-2xl tracking-wider">{forgeOfWeek.name}</h3>
                  <TierBadge tier={forgeOfWeek.tier} size="sm" />
                </div>
                <p className="text-sm text-muted-foreground italic mb-3">"{forgeOfWeek.motto}"</p>
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Users size={14} /> {forgeOfWeek.member_count} üye</span>
                  <span className="flex items-center gap-1"><Flame size={14} className="text-white" /> Heat {forgeOfWeek.heat_level}</span>
                  <span className="flex items-center gap-1"><TrendingUp size={14} /> {forgeOfWeek.season_points.toLocaleString()} SP</span>
                  <span className="flex items-center gap-1"><Zap size={14} /> Lv.{forgeOfWeek.level}</span>
                </div>
              </div>

              {/* View button */}
              <motion.button
                whileHover={{ x: 4 }}
                className="flex items-center gap-1 text-primary text-sm font-medium"
              >
                Görüntüle <ChevronRight size={16} />
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Search + Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="mb-6 space-y-4"
      >
        {/* Search bar */}
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Lonca ara..."
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 focus:bg-white/[0.05] transition-all text-sm backdrop-blur-sm"
          />
        </div>

        {/* Tier filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {TIER_FILTERS.map((tier) => (
            <motion.button
              key={tier.value}
              onClick={() => setActiveTier(tier.value)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                activeTier === tier.value
                  ? 'border-opacity-60 bg-opacity-20'
                  : 'border-white/[0.06] bg-white/[0.02] text-muted-foreground hover:text-foreground hover:bg-white/[0.04]'
              }`}
              style={activeTier === tier.value ? {
                borderColor: tier.color + '66',
                backgroundColor: tier.color + '15',
                color: tier.color,
                border: `1px solid ${tier.color}66`,
              } : {
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: tier.color }} />
              {tier.label}
              {activeTier === tier.value && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="ml-1"
                >
                  ({tier.value === 'all' ? guilds.length : guilds.filter(g => g.tier === tier.value).length})
                </motion.span>
              )}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Guild Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTier + search}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {filtered.map((guild, i) => (
            <GuildCard key={guild.id} guild={guild} index={i} />
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Empty state */}
      {filtered.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20"
        >
          <Flame size={48} className="mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">Bu filtrede lonca bulunamadı.</p>
        </motion.div>
      )}

      {/* Mobile FAB */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring" }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => navigate('/guilds/create')}
        className="md:hidden fixed bottom-6 right-6 h-14 w-14 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30 z-50"
      >
        <Plus size={24} className="text-black" />
      </motion.button>
    </div>
  );
}
