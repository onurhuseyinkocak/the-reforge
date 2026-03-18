import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import {
  Send,
  Users,
  Heart,
  Image,
  Trophy,
  Filter,
  Camera,
  X,
  Flame,
  MessageCircle,
  ChevronDown,
  Upload,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type PostFilter = "all" | "photo" | "milestone";

const PHASE_COLORS: Record<number, { bg: string; text: string; glow: string; label: string }> = {
  1: { bg: "from-orange-500/20 to-red-500/20", text: "text-orange-400", glow: "shadow-orange-500/20", label: "Ateş" },
  2: { bg: "from-blue-500/20 to-cyan-500/20", text: "text-blue-400", glow: "shadow-blue-500/20", label: "Su" },
  3: { bg: "from-emerald-500/20 to-green-500/20", text: "text-emerald-400", glow: "shadow-emerald-500/20", label: "Toprak" },
  4: { bg: "from-purple-500/20 to-violet-500/20", text: "text-purple-400", glow: "shadow-purple-500/20", label: "Rüzgar" },
  5: { bg: "from-yellow-500/20 to-amber-500/20", text: "text-yellow-400", glow: "shadow-yellow-500/20", label: "Yıldırım" },
};

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

const Community = () => {
  const { user, profile } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [content, setContent] = useState("");
  const [postType, setPostType] = useState<"text" | "photo" | "milestone">("text");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<PostFilter>("all");
  const [userLikes, setUserLikes] = useState<Set<string>>(new Set());
  const [comments, setComments] = useState<Record<string, any[]>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [openComments, setOpenComments] = useState<Set<string>>(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchPosts = async () => {
    const { data } = await supabase.from("community_posts")
      .select("*, profiles!community_posts_profile_fkey(full_name, current_phase, streak)")
      .order("created_at", { ascending: false }).limit(50);
    setPosts(data || []);
  };

  const fetchLikes = async () => {
    if (!user) return;
    const { data } = await supabase.from("community_likes").select("post_id").eq("user_id", user.id);
    setUserLikes(new Set((data || []).map(l => l.post_id)));
  };

  const fetchComments = async (postId: string) => {
    const { data } = await supabase.from("community_comments")
      .select("*").eq("post_id", postId).order("created_at", { ascending: true }) as any;
    if (data && data.length > 0) {
      const userIds = [...new Set(data.map((c: any) => c.user_id))] as string[];
      const { data: profiles } = await supabase.from("profiles").select("user_id, full_name").in("user_id", userIds);
      const nameMap: Record<string, string> = {};
      (profiles || []).forEach((p: any) => { nameMap[p.user_id] = p.full_name; });
      data.forEach((c: any) => { c.profiles = { full_name: nameMap[c.user_id] || "Kullanıcı" }; });
    }
    setComments(prev => ({ ...prev, [postId]: data || [] }));
  };

  useEffect(() => {
    fetchPosts();
    fetchLikes();
    const channel = supabase.channel("community_realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "community_posts" }, () => fetchPosts())
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "community_comments" }, (payload) => {
        const postId = (payload.new as any).post_id;
        if (openComments.has(postId)) fetchComments(postId);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setPostType("photo");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setPostType("photo");
    }
  };

  const handlePost = async () => {
    if (!user || !content.trim()) return;
    setLoading(true);
    let imageUrl: string | null = null;
    if (imageFile) {
      const ext = imageFile.name.split(".").pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from("community-images").upload(path, imageFile);
      if (uploadErr) { toast.error("Görsel yükleme hatası"); setLoading(false); return; }
      const { data: { publicUrl } } = supabase.storage.from("community-images").getPublicUrl(path);
      imageUrl = publicUrl;
    }
    const { error } = await supabase.from("community_posts").insert({
      user_id: user.id, content: content.trim(), phase_group: profile?.current_phase || 1,
      image_url: imageUrl, post_type: postType,
    });
    setLoading(false);
    if (error) toast.error("Hata: " + error.message);
    else {
      setContent(""); setImageFile(null); setImagePreview(null); setPostType("text");
      fetchPosts(); toast.success("Paylaşıldı! 🔥");
    }
  };

  const toggleLike = async (postId: string) => {
    if (!user) return;
    const liked = userLikes.has(postId);
    if (liked) {
      await supabase.from("community_likes").delete().eq("post_id", postId).eq("user_id", user.id);
      await supabase.from("community_posts").update({ likes_count: Math.max(0, (posts.find(p => p.id === postId)?.likes_count || 1) - 1) }).eq("id", postId);
      setUserLikes(prev => { const s = new Set(prev); s.delete(postId); return s; });
    } else {
      await supabase.from("community_likes").insert({ post_id: postId, user_id: user.id });
      await supabase.from("community_posts").update({ likes_count: (posts.find(p => p.id === postId)?.likes_count || 0) + 1 }).eq("id", postId);
      setUserLikes(prev => new Set(prev).add(postId));
    }
    fetchPosts();
  };

  const toggleComments = (postId: string) => {
    const next = new Set(openComments);
    if (next.has(postId)) next.delete(postId);
    else { next.add(postId); if (!comments[postId]) fetchComments(postId); }
    setOpenComments(next);
  };

  const postComment = async (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text || !user) return;
    const { error } = await supabase.from("community_comments").insert({ post_id: postId, user_id: user.id, content: text });
    if (error) toast.error("Yorum gönderilemedi");
    else {
      setCommentInputs(prev => ({ ...prev, [postId]: "" }));
      fetchComments(postId);
    }
  };

  const filtered = filter === "all" ? posts : posts.filter(p => p.post_type === filter);

  const getPhaseStyle = (phase: number) => PHASE_COLORS[phase] || PHASE_COLORS[1];

  return (
    <div className="relative min-h-screen">
      {/* Background glow orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 -left-32 w-96 h-96 bg-[#FF4500]/[0.04] rounded-full blur-[120px]" />
        <div className="absolute bottom-40 -right-32 w-80 h-80 bg-orange-500/[0.03] rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#FF4500]/[0.02] rounded-full blur-[150px]" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 space-y-6"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF4500] to-orange-600 flex items-center justify-center shadow-lg shadow-[#FF4500]/20">
                <Flame className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#0a0a0a] animate-pulse" />
            </div>
            <div>
              <h2 className="font-display text-2xl tracking-wide text-white">TOPLULUK</h2>
              <p className="text-xs text-white/40 mt-0.5">{posts.length} paylaşım</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06] text-xs text-white/50">
              <Users className="w-3 h-3 inline mr-1.5 text-[#FF4500]/60" />
              Aktif
            </div>
          </div>
        </motion.div>

        {/* Create Post */}
        <motion.div variants={itemVariants}>
          <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-xl p-5 shadow-xl">
            {/* Post type tabs */}
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={() => setPostType("text")}
                className={`px-4 py-2 rounded-xl text-xs font-medium transition-all duration-300 ${
                  postType === "text"
                    ? "bg-[#FF4500]/20 text-[#FF4500] shadow-inner shadow-[#FF4500]/10 border border-[#FF4500]/20"
                    : "bg-white/[0.03] text-white/40 border border-white/[0.06] hover:text-white/60 hover:bg-white/[0.05]"
                }`}
              >
                <MessageCircle className="w-3 h-3 inline mr-1.5" />
                Metin
              </button>
              <button
                onClick={() => setPostType("milestone")}
                className={`px-4 py-2 rounded-xl text-xs font-medium transition-all duration-300 ${
                  postType === "milestone"
                    ? "bg-yellow-400/20 text-yellow-400 shadow-inner shadow-yellow-400/10 border border-yellow-400/20"
                    : "bg-white/[0.03] text-white/40 border border-white/[0.06] hover:text-white/60 hover:bg-white/[0.05]"
                }`}
              >
                <Trophy className="w-3 h-3 inline mr-1.5" />
                Milestone
              </button>
            </div>

            {/* Textarea */}
            <div className="relative">
              <Textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder={postType === "milestone" ? "Başarını paylaş..." : "Topluluğa bir şey paylaş..."}
                className="bg-white/[0.02] border-white/[0.06] text-white placeholder:text-white/20 rounded-xl resize-none focus:border-[#FF4500]/30 focus:ring-1 focus:ring-[#FF4500]/20 transition-all duration-300 min-h-[100px]"
                rows={3}
              />
              {postType === "milestone" && (
                <div className="absolute top-3 right-3">
                  <Trophy className="w-5 h-5 text-yellow-400/30" />
                </div>
              )}
            </div>

            {/* Image preview */}
            <AnimatePresence>
              {imagePreview && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="relative mt-4 inline-block"
                >
                  <img src={imagePreview} alt="" className="h-36 rounded-xl object-cover border border-white/[0.06]" />
                  <button
                    onClick={() => { setImageFile(null); setImagePreview(null); if (postType === "photo") setPostType("text"); }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500/90 rounded-full flex items-center justify-center shadow-lg hover:bg-red-500 transition-colors"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Drag zone (shown when no image) */}
            {!imagePreview && (
              <div
                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`mt-4 border-2 border-dashed rounded-xl p-4 text-center transition-all duration-300 cursor-pointer ${
                  isDragging
                    ? "border-[#FF4500]/40 bg-[#FF4500]/[0.05]"
                    : "border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.02]"
                }`}
                onClick={() => fileRef.current?.click()}
              >
                <Upload className={`w-5 h-5 mx-auto mb-1.5 transition-colors ${isDragging ? "text-[#FF4500]" : "text-white/20"}`} />
                <p className={`text-xs transition-colors ${isDragging ? "text-[#FF4500]/70" : "text-white/20"}`}>
                  Görsel yüklemek için tıkla veya sürükleyip bırak
                </p>
              </div>
            )}

            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />

            {/* Actions */}
            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={() => fileRef.current?.click()}
                className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.1] transition-all duration-300 group"
              >
                <Camera className="w-4 h-4 text-white/30 group-hover:text-[#FF4500]/70 transition-colors" />
              </button>
              <Button
                onClick={handlePost}
                disabled={loading || !content.trim()}
                className="ml-auto bg-gradient-to-r from-[#FF4500] to-orange-600 hover:from-[#FF4500]/90 hover:to-orange-600/90 text-white border-0 rounded-xl px-6 shadow-lg shadow-[#FF4500]/20 disabled:opacity-30 disabled:shadow-none transition-all duration-300"
              >
                <Send className="w-4 h-4 mr-2" />
                {loading ? "Gönderiliyor..." : "Paylaş"}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Filter tabs */}
        <motion.div variants={itemVariants} className="flex gap-2">
          {([
            ["all", "Tümü", Filter],
            ["photo", "Fotoğraflar", Image],
            ["milestone", "Başarılar", Trophy],
          ] as const).map(([key, label, Icon]) => (
            <motion.button
              key={key}
              onClick={() => setFilter(key)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all duration-300 ${
                filter === key
                  ? "bg-[#FF4500]/15 text-[#FF4500] border border-[#FF4500]/20 shadow-lg shadow-[#FF4500]/10"
                  : "bg-white/[0.03] border border-white/[0.06] text-white/40 hover:text-white/60 hover:bg-white/[0.05]"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </motion.button>
          ))}
        </motion.div>

        {/* Posts feed */}
        <div className="space-y-5">
          <AnimatePresence mode="popLayout">
            {filtered.map((p, index) => {
              const phase = getPhaseStyle(p.phase_group || 1);
              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  layout
                >
                  <div
                    className={`rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-xl overflow-hidden shadow-xl transition-all duration-500 hover:bg-white/[0.04] hover:border-white/[0.08] ${
                      p.post_type === "milestone" ? "ring-1 ring-yellow-400/20" : ""
                    }`}
                  >
                    {/* Milestone top accent */}
                    {p.post_type === "milestone" && (
                      <div className="h-0.5 bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent" />
                    )}

                    {/* Post image */}
                    {p.image_url && (
                      <div className="relative group">
                        <img
                          src={p.image_url}
                          alt=""
                          className="w-full h-72 object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      </div>
                    )}

                    <div className="p-5">
                      {/* User info header */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`relative w-11 h-11 rounded-xl bg-gradient-to-br ${phase.bg} flex items-center justify-center border border-white/[0.08]`}>
                          <span className={`${phase.text} font-bold text-sm`}>
                            {(p.profiles as any)?.full_name?.charAt(0)?.toUpperCase() || "?"}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm text-white font-semibold truncate">
                              {(p.profiles as any)?.full_name || "Anonim"}
                            </p>
                            {p.post_type === "milestone" && (
                              <motion.div
                                animate={{ rotate: [0, 10, -10, 0] }}
                                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                              >
                                <Trophy className="w-4 h-4 text-yellow-400" />
                              </motion.div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-white/30 mt-0.5">
                            <span>{format(new Date(p.created_at), "d MMM HH:mm", { locale: tr })}</span>
                            {(p.profiles as any)?.streak > 0 && (
                              <span className="flex items-center gap-0.5 text-[#FF4500]/70">
                                <Flame className="w-3 h-3" />
                                {(p.profiles as any)?.streak}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className={`px-3 py-1.5 rounded-lg bg-gradient-to-r ${phase.bg} border border-white/[0.06]`}>
                          <span className={`text-[10px] font-semibold ${phase.text} uppercase tracking-wider`}>
                            Faz {p.phase_group}
                          </span>
                        </div>
                      </div>

                      {/* Post content */}
                      <p className={`text-sm leading-relaxed ${
                        p.post_type === "milestone"
                          ? "text-white text-base font-medium"
                          : "text-white/80"
                      }`}>
                        {p.content}
                      </p>

                      {/* Actions */}
                      <div className="flex items-center gap-1 mt-5 pt-4 border-t border-white/[0.04]">
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => toggleLike(p.id)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all duration-300 ${
                            userLikes.has(p.id)
                              ? "text-red-400 bg-red-400/10"
                              : "text-white/30 hover:text-red-400 hover:bg-red-400/5"
                          }`}
                        >
                          <motion.div
                            animate={userLikes.has(p.id) ? { scale: [1, 1.3, 1] } : {}}
                            transition={{ duration: 0.3 }}
                          >
                            <Heart className={`w-4 h-4 ${userLikes.has(p.id) ? "fill-current" : ""}`} />
                          </motion.div>
                          <span className="text-xs font-medium">{p.likes_count || 0}</span>
                        </motion.button>

                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => toggleComments(p.id)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all duration-300 ${
                            openComments.has(p.id)
                              ? "text-[#FF4500] bg-[#FF4500]/10"
                              : "text-white/30 hover:text-[#FF4500] hover:bg-[#FF4500]/5"
                          }`}
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span className="text-xs font-medium">{comments[p.id]?.length || 0}</span>
                          <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${openComments.has(p.id) ? "rotate-180" : ""}`} />
                        </motion.button>
                      </div>

                      {/* Comments section */}
                      <AnimatePresence>
                        {openComments.has(p.id) && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <div className="mt-4 space-y-3">
                              {(comments[p.id] || []).map((c, ci) => (
                                <motion.div
                                  key={c.id}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: ci * 0.05 }}
                                  className="flex gap-3"
                                >
                                  <div className="w-7 h-7 rounded-lg bg-white/[0.05] border border-white/[0.06] flex items-center justify-center text-[10px] text-white/40 font-bold flex-shrink-0">
                                    {(c.profiles as any)?.full_name?.charAt(0)?.toUpperCase() || "?"}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="bg-white/[0.03] border border-white/[0.04] rounded-xl px-3 py-2">
                                      <span className="text-white/60 font-medium text-xs">{(c.profiles as any)?.full_name}</span>
                                      <p className="text-white/50 text-xs mt-0.5 leading-relaxed">{c.content}</p>
                                    </div>
                                  </div>
                                </motion.div>
                              ))}

                              {/* Comment input */}
                              <div className="flex gap-2 mt-3">
                                <Input
                                  value={commentInputs[p.id] || ""}
                                  onChange={e => setCommentInputs(prev => ({ ...prev, [p.id]: e.target.value }))}
                                  onKeyDown={e => e.key === "Enter" && postComment(p.id)}
                                  placeholder="Yorum yaz..."
                                  className="bg-white/[0.02] border-white/[0.06] text-white placeholder:text-white/15 text-xs h-9 rounded-xl focus:border-[#FF4500]/30 focus:ring-1 focus:ring-[#FF4500]/20"
                                />
                                <Button
                                  size="sm"
                                  onClick={() => postComment(p.id)}
                                  className="bg-[#FF4500]/20 hover:bg-[#FF4500]/30 text-[#FF4500] border-0 h-9 px-3 rounded-xl"
                                >
                                  <Send className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Empty state */}
          {filtered.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-xl p-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white/10" />
                </div>
                <p className="text-white/30 text-sm">Henuz paylasim yok.</p>
                <p className="text-white/15 text-xs mt-1">Ilk sen paylas!</p>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Community;
