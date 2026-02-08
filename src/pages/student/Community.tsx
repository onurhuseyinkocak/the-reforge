import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Send, Users, Heart, Image, Trophy, Filter, Camera, X, Flame } from "lucide-react";

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

  useEffect(() => { fetchPosts(); fetchLikes(); }, [user]);

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

  const filtered = filter === "all" ? posts : posts.filter(p => p.post_type === filter);

  const getTypeIcon = (type: string) => {
    if (type === "milestone") return <Trophy className="w-4 h-4 text-yellow-400" />;
    if (type === "photo") return <Image className="w-4 h-4 text-primary" />;
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl text-foreground flex items-center gap-2">
          <Flame className="w-6 h-6 text-primary" /> Topluluk
        </h2>
      </div>

      {/* Create Post */}
      <Card className="bg-card border-border/30 p-5">
        <div className="flex items-center gap-2 mb-3">
          <button onClick={() => setPostType("text")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${postType === "text" ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"}`}>
            Metin
          </button>
          <button onClick={() => setPostType("milestone")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${postType === "milestone" ? "bg-yellow-400/20 text-yellow-400" : "bg-secondary text-muted-foreground"}`}>
            <Trophy className="w-3 h-3 inline mr-1" /> Milestone
          </button>
        </div>
        <Textarea value={content} onChange={e => setContent(e.target.value)}
          placeholder={postType === "milestone" ? "🏆 Başarını paylaş! Ne başardın?" : "Topluluğa bir şey paylaş..."}
          className="bg-background border-border/30 text-foreground mb-3" rows={3} />

        {imagePreview && (
          <div className="relative mb-3 inline-block">
            <img src={imagePreview} alt="" className="h-32 rounded-lg object-cover" />
            <button onClick={() => { setImageFile(null); setImagePreview(null); if (postType === "photo") setPostType("text"); }}
              className="absolute -top-2 -right-2 bg-destructive rounded-full p-1">
              <X className="w-3 h-3 text-destructive-foreground" />
            </button>
          </div>
        )}

        <div className="flex items-center gap-2">
          <label className="cursor-pointer p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition">
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
            <Camera className="w-5 h-5 text-muted-foreground" />
          </label>
          <Button onClick={handlePost} disabled={loading || !content.trim()} className="ml-auto bg-primary hover:bg-primary/90 text-primary-foreground">
            <Send className="w-4 h-4 mr-2" /> {loading ? "Paylaşılıyor..." : "Paylaş"}
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
          <Card key={p.id} className={`bg-card border-border/30 overflow-hidden ${p.post_type === "milestone" ? "ring-1 ring-yellow-400/30" : ""}`}>
            {p.image_url && (
              <img src={p.image_url} alt="" className="w-full h-64 object-cover" />
            )}
            <div className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                  {(p.profiles as any)?.full_name?.charAt(0)?.toUpperCase() || "?"}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-foreground font-semibold">{(p.profiles as any)?.full_name || "Anonim"}</p>
                    {getTypeIcon(p.post_type)}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{format(new Date(p.created_at), "d MMM HH:mm", { locale: tr })}</span>
                    {(p.profiles as any)?.streak > 0 && (
                      <span className="flex items-center gap-0.5 text-primary">
                        <Flame className="w-3 h-3" /> {(p.profiles as any)?.streak}
                      </span>
                    )}
                  </div>
                </div>
                <Badge className="bg-primary/10 text-primary text-xs border-0">Faz {p.phase_group}</Badge>
              </div>
              <p className={`text-sm text-foreground/90 leading-relaxed ${p.post_type === "milestone" ? "text-base font-medium" : ""}`}>{p.content}</p>
              <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border/20">
                <button onClick={() => toggleLike(p.id)}
                  className={`flex items-center gap-1.5 text-sm transition ${userLikes.has(p.id) ? "text-red-400" : "text-muted-foreground hover:text-red-400"}`}>
                  <Heart className={`w-4 h-4 ${userLikes.has(p.id) ? "fill-current" : ""}`} />
                  {p.likes_count || 0}
                </button>
              </div>
            </div>
          </Card>
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
