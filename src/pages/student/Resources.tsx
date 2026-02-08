import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { BookOpen, Lock, ExternalLink, Video, FileText, Search, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const typeIcons: Record<string, any> = {
  article: FileText,
  video: Video,
  default: BookOpen,
};

type FilterType = "all" | "article" | "video";

const Resources = () => {
  const { user, profile } = useAuth();
  const [resources, setResources] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    supabase.from("resources").select("*").order("phase_required").order("created_at")
      .then(({ data }) => setResources(data || []));
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
      toast.success("İşaret kaldırıldı");
    } else {
      await supabase.from("resource_completions").insert({ user_id: user.id, resource_id: resourceId });
      setCompletedIds(prev => new Set(prev).add(resourceId));
      toast.success("Tamamlandı olarak işaretlendi ✅");
    }
  };

  const currentPhase = profile?.current_phase || 1;

  const filtered = resources.filter(r => {
    const matchSearch = !search || r.title?.toLowerCase().includes(search.toLowerCase()) || r.description?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || r.content_type === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl text-foreground">Kaynak Kütüphanesi</h2>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Kaynak ara..."
            className="bg-card border-border/30 text-foreground pl-10" />
        </div>
        <div className="flex gap-2">
          {([["all", "Tümü"], ["article", "Makale"], ["video", "Video"]] as const).map(([key, label]) => (
            <button key={key} onClick={() => setFilter(key)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${filter === key ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Completion Progress */}
      <div className="text-xs text-muted-foreground">
        {completedIds.size}/{resources.filter(r => r.phase_required <= currentPhase).length} kaynak tamamlandı
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(r => {
          const locked = r.phase_required > currentPhase;
          const completed = completedIds.has(r.id);
          const Icon = typeIcons[r.content_type] || typeIcons.default;
          return (
            <Card key={r.id} className={`bg-card border-border/30 p-5 transition-all ${locked ? "opacity-50" : completed ? "border-green-500/30 bg-green-500/5" : "hover:border-primary/30"}`}>
              <div className="flex items-start justify-between mb-3">
                <Icon className={`w-5 h-5 ${locked ? "text-muted-foreground" : completed ? "text-green-400" : "text-primary"}`} />
                <div className="flex items-center gap-2">
                  {!locked && (
                    <button onClick={() => toggleComplete(r.id)} className="transition hover:scale-110">
                      <CheckCircle2 className={`w-5 h-5 ${completed ? "text-green-400 fill-green-400/20" : "text-muted-foreground/40 hover:text-green-400"}`} />
                    </button>
                  )}
                  <Badge className={locked ? "bg-secondary text-muted-foreground" : "bg-primary/20 text-primary"}>
                    Faz {r.phase_required}
                  </Badge>
                </div>
              </div>
              <h3 className="text-foreground font-medium mb-1">{r.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{r.description}</p>
              {locked ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Lock className="w-4 h-4" /> Faz {r.phase_required}'da açılacak
                </div>
              ) : r.content_url ? (
                <a href={r.content_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
                  <ExternalLink className="w-4 h-4" /> İçeriği Aç
                </a>
              ) : null}
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <Card className="bg-card border-border/30 p-8 col-span-full text-center">
            <BookOpen className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">Sonuç bulunamadı</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Resources;
