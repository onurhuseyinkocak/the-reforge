import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Lock, ExternalLink, Video, FileText } from "lucide-react";

const typeIcons: Record<string, any> = {
  article: FileText,
  video: Video,
  default: BookOpen,
};

const Resources = () => {
  const { profile } = useAuth();
  const [resources, setResources] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("resources").select("*").order("phase_required").order("created_at")
      .then(({ data }) => setResources(data || []));
  }, []);

  const currentPhase = profile?.current_phase || 1;

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl text-foreground">Kaynak Kütüphanesi</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {resources.map(r => {
          const locked = r.phase_required > currentPhase;
          const Icon = typeIcons[r.content_type] || typeIcons.default;
          return (
            <Card key={r.id} className={`bg-card border-border/30 p-5 transition-opacity ${locked ? "opacity-50" : "hover:border-primary/30"}`}>
              <div className="flex items-start justify-between mb-3">
                <Icon className={`w-5 h-5 ${locked ? "text-muted-foreground" : "text-primary"}`} />
                <Badge className={locked ? "bg-secondary text-muted-foreground" : "bg-primary/20 text-primary"}>
                  Faz {r.phase_required}
                </Badge>
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
        {resources.length === 0 && (
          <Card className="bg-card border-border/30 p-8 col-span-full text-center">
            <BookOpen className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">Henüz kaynak eklenmemiş</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Resources;
