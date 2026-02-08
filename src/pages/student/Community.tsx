import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Send, Users } from "lucide-react";

const Community = () => {
  const { user, profile } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchPosts = async () => {
    const { data } = await supabase.from("community_posts").select("*, profiles!community_posts_profile_fkey(full_name, current_phase)")
      .order("created_at", { ascending: false }).limit(50);
    setPosts(data || []);
  };

  useEffect(() => { fetchPosts(); }, []);

  const handlePost = async () => {
    if (!user || !content.trim()) return;
    setLoading(true);
    const { error } = await supabase.from("community_posts").insert({
      user_id: user.id, content: content.trim(), phase_group: profile?.current_phase || 1,
    });
    setLoading(false);
    if (error) toast.error("Hata: " + error.message);
    else { setContent(""); fetchPosts(); toast.success("Paylaşıldı!"); }
  };

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl text-foreground flex items-center gap-2">
        <Users className="w-6 h-6 text-primary" /> Topluluk
      </h2>

      <Card className="bg-card border-border/30 p-4">
        <Textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Topluluğa bir şey paylaş..."
          className="bg-background border-border/30 text-foreground mb-3" rows={3} />
        <Button onClick={handlePost} disabled={loading || !content.trim()} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Send className="w-4 h-4 mr-2" /> {loading ? "Paylaşılıyor..." : "Paylaş"}
        </Button>
      </Card>

      <div className="space-y-3">
        {posts.map(p => (
          <Card key={p.id} className="bg-card border-border/30 p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-bold">
                {(p.profiles as any)?.full_name?.charAt(0)?.toUpperCase() || "?"}
              </div>
              <div>
                <p className="text-sm text-foreground font-medium">{(p.profiles as any)?.full_name || "Anonim"}</p>
                <p className="text-xs text-muted-foreground">{format(new Date(p.created_at), "d MMM HH:mm", { locale: tr })}</p>
              </div>
              <Badge className="ml-auto bg-primary/20 text-primary text-xs">Faz {p.phase_group}</Badge>
            </div>
            <p className="text-sm text-foreground/80">{p.content}</p>
          </Card>
        ))}
        {posts.length === 0 && (
          <Card className="bg-card border-border/30 p-8 text-center">
            <p className="text-muted-foreground">Henüz paylaşım yok. İlk sen paylaş!</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Community;
