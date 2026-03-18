import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { BookOpen, Lock, ExternalLink, Video, FileText, Search, CheckCircle2, Sparkles, Filter, Library, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";

const typeIcons: Record<string, any> = {
  article: FileText,
  video: Video,
  default: BookOpen,
};

const typeColors: Record<string, { hex: string; label: string }> = {
  article: { hex: "#a855f7", label: "Makale" },
  video: { hex: "#ef4444", label: "Video" },
  default: { hex: "#FF4500", label: "Kaynak" },
};

type FilterType = "all" | "article" | "video";

const PAGE_SIZE = 18;

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const cardAnim = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const Resources = () => {
  const { user, profile } = useAuth();
  const [resources, setResources] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  // Infinite scroll state
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const fetchResources = async (offset = 0, append = false) => {
    if (offset === 0) setInitialLoading(true);
    else setLoadingMore(true);

    const { data, count } = await supabase
      .from("resources")
      .select("*", { count: "exact" })
      .order("phase_required")
      .order("created_at")
      .range(offset, offset + PAGE_SIZE - 1);

    const newResources = data || [];

    if (append) {
      setResources(prev => [...prev, ...newResources]);
    } else {
      setResources(newResources);
    }

    if (count !== null) setTotalCount(count);
    setHasMore(newResources.length === PAGE_SIZE);
    setInitialLoading(false);
    setLoadingMore(false);
  };

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;
    fetchResources(resources.length, true);
  }, [resources.length, loadingMore, hasMore]);

  const sentinelRef = useInfiniteScroll(loadMore, hasMore, loadingMore);

  useEffect(() => {
    fetchResources(0, false);
    if (user) {
      supabase.from("resource_completions").select("resource_id").eq("user_id", user.id)
        .then(({ data }) => setCompletedIds(new Set((data || []).map(d => d.resource_id))));
    }
  }, [user]);

  const toggleComplete = async (resourceId: string) => {
    if (!user) return;
    if (completedIds.has(resourceId)) {
      await supabase.from("resource_completions").delete().eq("user_id", user.id).eq("resource_id", resourceId);
      setCompletedIds(prev => { const s = new Set(prev); s.delete(resourceId); return s; });
      toast.success("Isaret kaldirildi");
    } else {
      await supabase.from("resource_completions").insert({ user_id: user.id, resource_id: resourceId });
      setCompletedIds(prev => new Set(prev).add(resourceId));
      toast.success("Tamamlandi olarak isaretlendi!");
    }
  };

  const currentPhase = profile?.current_phase || 1;

  const filtered = resources.filter(r => {
    const matchSearch = !search || r.title?.toLowerCase().includes(search.toLowerCase()) || r.description?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || r.content_type === filter;
    return matchSearch && matchFilter;
  });

  const accessibleCount = resources.filter(r => r.phase_required <= currentPhase).length;
  const completionPercent = accessibleCount > 0 ? Math.round((completedIds.size / accessibleCount) * 100) : 0;

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6 relative"
    >
      {/* Background glow orbs */}
      <div className="fixed top-40 left-1/3 w-[500px] h-[500px] bg-[#FF4500]/[0.03] rounded-full blur-[130px] pointer-events-none" />
      <div className="fixed bottom-32 right-1/3 w-[400px] h-[400px] bg-purple-500/[0.02] rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <motion.div variants={cardAnim}>
        <div className="relative overflow-hidden rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-xl">
          <div className="h-[2px] bg-gradient-to-r from-transparent via-[#FF4500]/50 to-transparent" />
          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-[#FF4500]/10 flex items-center justify-center">
                  <Library className="w-5 h-5 text-[#FF4500]" />
                </div>
                <div>
                  <h2 className="font-display text-2xl text-white tracking-wide">Kaynak Kutuphanesi</h2>
                  <p className="text-xs text-white/30 mt-0.5">{totalCount || resources.length} kaynak mevcut</p>
                </div>
              </div>

              {/* Completion progress */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs text-white/40">Tamamlanan</p>
                  <p className="text-sm font-bold text-white">{completedIds.size}/{accessibleCount}</p>
                </div>
                <div className="relative w-12 h-12">
                  <svg width="48" height="48" className="transform -rotate-90">
                    <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
                    <circle
                      cx="24" cy="24" r="20" fill="none" stroke="#FF4500" strokeWidth="3"
                      strokeDasharray={2 * Math.PI * 20}
                      strokeDashoffset={2 * Math.PI * 20 - (completionPercent / 100) * 2 * Math.PI * 20}
                      strokeLinecap="round"
                      className="transition-all duration-700"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-[#FF4500]">
                    {completionPercent}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Search + Filters */}
      <motion.div variants={cardAnim} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Kaynak ara..."
            className="bg-white/[0.03] border-white/[0.06] text-white placeholder:text-white/20 pl-11 h-11 rounded-xl backdrop-blur-xl focus:border-[#FF4500]/30 transition-colors"
          />
        </div>
        <div className="flex gap-2">
          {([["all", "Tumu", Filter], ["article", "Makale", FileText], ["video", "Video", Video]] as const).map(([key, label, Icon]) => (
            <motion.button
              key={key}
              onClick={() => setFilter(key as FilterType)}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-medium transition-all duration-300"
              style={{
                background: filter === key ? 'rgba(255,69,0,0.15)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${filter === key ? 'rgba(255,69,0,0.3)' : 'rgba(255,255,255,0.06)'}`,
                color: filter === key ? '#FF4500' : 'rgba(255,255,255,0.4)',
              }}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Resource Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        <AnimatePresence mode="popLayout">
          {filtered.map(r => {
            const locked = r.phase_required > currentPhase;
            const completed = completedIds.has(r.id);
            const Icon = typeIcons[r.content_type] || typeIcons.default;
            const typeColor = typeColors[r.content_type] || typeColors.default;

            return (
              <motion.div
                key={r.id}
                variants={cardAnim}
                layout
                whileHover={locked ? {} : { y: -2 }}
                transition={{ duration: 0.2 }}
                className="group relative"
              >
                <div
                  className="relative overflow-hidden rounded-xl h-full backdrop-blur-xl transition-all duration-300"
                  style={{
                    background: completed
                      ? 'rgba(34,197,94,0.03)'
                      : locked
                      ? 'rgba(255,255,255,0.015)'
                      : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${completed ? 'rgba(34,197,94,0.15)' : locked ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.06)'}`,
                    opacity: locked ? 0.5 : 1,
                  }}
                >
                  {/* Top accent line */}
                  <div
                    className="h-[2px]"
                    style={{
                      background: completed
                        ? 'linear-gradient(to right, transparent, rgba(34,197,94,0.5), transparent)'
                        : locked
                        ? 'linear-gradient(to right, transparent, rgba(255,255,255,0.05), transparent)'
                        : `linear-gradient(to right, transparent, ${typeColor.hex}40, transparent)`,
                    }}
                  />

                  <div className="p-5">
                    {/* Header row */}
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
                        style={{
                          background: completed ? 'rgba(34,197,94,0.1)' : locked ? 'rgba(255,255,255,0.04)' : `${typeColor.hex}15`,
                        }}
                      >
                        <Icon
                          className="w-5 h-5"
                          style={{ color: completed ? '#22c55e' : locked ? 'rgba(255,255,255,0.2)' : typeColor.hex }}
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        {!locked && (
                          <motion.button
                            onClick={() => toggleComplete(r.id)}
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.9 }}
                            className="relative"
                          >
                            {completed ? (
                              <div className="relative">
                                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                                <div className="absolute inset-0 animate-ping">
                                  <CheckCircle2 className="w-6 h-6 text-emerald-400 opacity-20" />
                                </div>
                              </div>
                            ) : (
                              <div className="w-6 h-6 rounded-full border-2 border-white/10 hover:border-emerald-500/50 transition-colors" />
                            )}
                          </motion.button>
                        )}
                        <Badge
                          className="text-[10px] font-semibold border-0 px-2.5 py-1 rounded-lg"
                          style={{
                            background: locked ? 'rgba(255,255,255,0.04)' : 'rgba(255,69,0,0.1)',
                            color: locked ? 'rgba(255,255,255,0.3)' : '#FF4500',
                          }}
                        >
                          Faz {r.phase_required}
                        </Badge>
                      </div>
                    </div>

                    {/* Content type pill */}
                    <div className="mb-3">
                      <span
                        className="text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded-md"
                        style={{ background: `${typeColor.hex}10`, color: `${typeColor.hex}CC` }}
                      >
                        {typeColor.label}
                      </span>
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-white font-medium mb-1.5 leading-snug">{r.title}</h3>
                    <p className="text-sm text-white/30 line-clamp-2 mb-4 leading-relaxed">{r.description}</p>

                    {/* Action */}
                    {locked ? (
                      <div className="flex items-center gap-2 text-sm text-white/20 pt-2 border-t border-white/[0.04]">
                        <Lock className="w-4 h-4" />
                        <span>Faz {r.phase_required}'da acilacak</span>
                      </div>
                    ) : r.content_url ? (
                      <motion.a
                        href={r.content_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ x: 3 }}
                        className="flex items-center gap-2 text-sm font-medium pt-2 border-t border-white/[0.04] transition-colors"
                        style={{ color: typeColor.hex }}
                      >
                        <ExternalLink className="w-4 h-4" />
                        Icerigi Ac
                        <Sparkles className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                      </motion.a>
                    ) : null}
                  </div>

                  {/* Completed overlay effect */}
                  {completed && (
                    <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50" />
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filtered.length === 0 && !initialLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="col-span-full"
          >
            <div className="relative overflow-hidden rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-xl p-12 text-center">
              <div className="h-[2px] absolute top-0 left-0 right-0 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent" />
              <div className="w-16 h-16 rounded-2xl bg-white/[0.04] flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-white/20" />
              </div>
              <p className="text-white/30 text-lg font-display">Sonuc bulunamadi</p>
              <p className="text-white/15 text-sm mt-1">Farkli bir arama deneyin</p>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} className="h-1" />

      {/* Loading more spinner */}
      {loadingMore && (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="w-5 h-5 text-[#FF4500]/60 animate-spin" />
          <span className="ml-2 text-xs text-white/30">Daha fazla yukleniyor...</span>
        </div>
      )}

      {/* No more resources message */}
      {!hasMore && resources.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-6"
        >
          <p className="text-xs text-white/20">Hepsi bu kadar</p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Resources;
