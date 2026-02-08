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
import { Send, Users, Heart, Image, Trophy, Filter, Camera, X, Flame, MessageCircle, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type PostFilter = "all" | "photo" | "milestone";

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
    // Fetch commenter names
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
    // Realtime
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl text-foreground flex items-center gap-2">
          <Flame className="w-6 h-6 text-primary" /> Topluluk
        </h2>
      </div>

      {/* Create Post */}
      <Card className="bg-card border-border/30 p-5">
        <div className="flex items-center gap-2 mb-3">
          <button onClick={() => setPostType("text")} className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${postType === "text" ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"}`}>Metin</button>
          <button onClick={() => setPostType("milestone")} className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${postType === "milestone" ? "bg-yellow-400/20 text-yellow-400" : "bg-secondary text-muted-foreground"}`}>
            <Trophy className="w-3 h-3 inline mr-1" /> Milestone
          </button>
        </div>
        <Textarea value={content} onChange={e => setContent(e.target.value)}
          placeholder={postType === "milestone" ? "🏆 Başarını paylaş!" : "Topluluğa bir şey paylaş..."}
          className="bg-background border-border/30 text-foreground mb-3" rows={3} />
        {imagePreview && (
          <div className="relative mb-3 inline-block">
            <img src={imagePreview} alt="" className="h-32 rounded-lg object-cover" />
            <button onClick={() => { setImageFile(null); setImagePreview(null); if (postType === "photo") setPostType("text"); }}
              className="absolute -top-2 -right-2 bg-destructive rounded-full p-1"><X className="w-3 h-3 text-destructive-foreground" /></button>
          </div>
        )}
        <div className="flex items-center gap-2">
          <label className="cursor-pointer p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition">
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
            <Camera className="w-5 h-5 text-muted-foreground" />
          </label>
          <Button onClick={handlePost} disabled={loading || !content.trim()} className="ml-auto bg-primary hover:bg-primary/90 text-primary-foreground">
            <Send className="w-4 h-4 mr-2" /> {loading ? "..." : "Paylaş"}
          </Button>
        </div>
      </Card>

      {/* Filters */}
      <div className="flex gap-2">
        {([["all", "Tümü", Filter], ["photo", "Fotoğraflar", Image], ["milestone", "Başarılar", Trophy]] as const).map(([key, label, Icon]) => (
          <button key={key} onClick={() => setFilter(key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition ${filter === key ? "bg-primary/20 text-primary" : "bg-card border border-border/30 text-muted-foreground hover:text-foreground"}`}>
            <Icon className="w-3 h-3" /> {label}
          </button>
        ))}
      </div>

      {/* Posts */}
      <div className="space-y-4">
        {filtered.map(p => (
          <motion.div key={p.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
            <Card className={`bg-card border-border/30 overflow-hidden ${p.post_type === "milestone" ? "ring-1 ring-yellow-400/30" : ""}`}>
              {p.image_url && <img src={p.image_url} alt="" className="w-full h-64 object-cover" loading="lazy" />}
              <div className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                    {(p.profiles as any)?.full_name?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-foreground font-semibold">{(p.profiles as any)?.full_name || "Anonim"}</p>
                      {p.post_type === "milestone" && <Trophy className="w-4 h-4 text-yellow-400" />}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{format(new Date(p.created_at), "d MMM HH:mm", { locale: tr })}</span>
                      {(p.profiles as any)?.streak > 0 && (
                        <span className="flex items-center gap-0.5 text-orange-400"><Flame className="w-3 h-3" /> {(p.profiles as any)?.streak}</span>
                      )}
                    </div>
                  </div>
                  <Badge className="bg-primary/10 text-primary text-xs border-0">Faz {p.phase_group}</Badge>
                </div>
                <p className={`text-sm text-foreground/90 leading-relaxed ${p.post_type === "milestone" ? "text-base font-medium" : ""}`}>{p.content}</p>

                {/* Actions */}
                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border/20">
                  <button onClick={() => toggleLike(p.id)}
                    className={`flex items-center gap-1.5 text-sm transition ${userLikes.has(p.id) ? "text-red-400" : "text-muted-foreground hover:text-red-400"}`}>
                    <Heart className={`w-4 h-4 ${userLikes.has(p.id) ? "fill-current" : ""}`} /> {p.likes_count || 0}
                  </button>
                  <button onClick={() => toggleComments(p.id)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition">
                    <MessageCircle className="w-4 h-4" /> {comments[p.id]?.length || 0}
                    <ChevronDown className={`w-3 h-3 transition-transform ${openComments.has(p.id) ? "rotate-180" : ""}`} />
                  </button>
                </div>

                {/* Comments */}
                <AnimatePresence>
                  {openComments.has(p.id) && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="mt-3 space-y-2">
                        {(comments[p.id] || []).map(c => (
                          <div key={c.id} className="flex gap-2 text-sm">
                            <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-[10px] text-foreground font-bold flex-shrink-0">
                              {(c.profiles as any)?.full_name?.charAt(0)?.toUpperCase() || "?"}
                            </div>
                            <div>
                              <span className="text-foreground font-medium text-xs">{(c.profiles as any)?.full_name}</span>
                              <p className="text-foreground/80 text-xs">{c.content}</p>
                            </div>
                          </div>
                        ))}
                        <div className="flex gap-2 mt-2">
                          <Input value={commentInputs[p.id] || ""} onChange={e => setCommentInputs(prev => ({ ...prev, [p.id]: e.target.value }))}
                            onKeyDown={e => e.key === "Enter" && postComment(p.id)}
                            placeholder="Yorum yaz..." className="bg-background border-border/30 text-foreground text-xs h-8" />
                          <Button size="sm" onClick={() => postComment(p.id)} className="bg-primary hover:bg-primary/90 h-8 px-3">
                            <Send className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Card>
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <Card className="bg-card border-border/30 p-10 text-center">
            <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Henüz paylaşım yok. İlk sen paylaş!</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Community;
