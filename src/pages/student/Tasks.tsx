import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CheckCircle2, Clock, Image } from "lucide-react";

const statusMap: Record<string, { label: string; color: string }> = {
  pending: { label: "Bekliyor", color: "bg-yellow-500/20 text-yellow-400" },
  in_progress: { label: "Devam Ediyor", color: "bg-ember-glow/20 text-ember-glow" },
  submitted: { label: "Gönderildi", color: "bg-ember-dark/20 text-ember" },
  approved: { label: "Onaylandı", color: "bg-green-500/20 text-green-400" },
  rejected: { label: "Reddedildi", color: "bg-red-500/20 text-red-400" },
};

const Tasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("student_tasks").select("*, tasks(*)").eq("user_id", user.id).order("created_at", { ascending: false });
    setTasks(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchTasks(); }, [user]);

  const markComplete = async (taskId: string) => {
    const { error } = await supabase
      .from("student_tasks").update({ status: "submitted", submitted_at: new Date().toISOString() }).eq("id", taskId);
    if (error) toast.error("Hata");
    else { toast.success("Görev tamamlandı olarak işaretlendi!"); fetchTasks(); }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl text-foreground">Haftalık Görevler</h2>
        <div className="flex gap-2 text-xs">
          <span className="text-muted-foreground">{tasks.filter(t => t.status === "approved").length}/{tasks.length} tamamlandı</span>
        </div>
      </div>

      {tasks.length === 0 ? (
        <Card className="bg-card border-border/30 p-8 text-center">
          <p className="text-muted-foreground">Henüz görev atanmamış</p>
        </Card>
      ) : (
        tasks.map(st => (
          <Card key={st.id} className="bg-card border-border/30 p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h4 className="text-foreground font-medium">{st.tasks?.title || "Görev"}</h4>
                {st.tasks?.description && <p className="text-sm text-muted-foreground mt-1">{st.tasks.description}</p>}
                <div className="flex items-center gap-3 mt-2">
                  <Badge className={statusMap[st.status]?.color || ""}>{statusMap[st.status]?.label}</Badge>
                  {st.tasks?.due_date && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {st.tasks.due_date}
                    </span>
                  )}
                </div>
                {st.reviewer_notes && (
                  <p className="text-xs text-muted-foreground mt-2 p-2 bg-secondary rounded">📝 {st.reviewer_notes}</p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                {(st.status === "pending" || st.status === "in_progress") && (
                  <Button size="sm" onClick={() => markComplete(st.id)} className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Tamamla
                  </Button>
                )}
                {st.proof_image_url && (
                  <a href={st.proof_image_url} target="_blank" className="text-xs text-primary flex items-center gap-1">
                    <Image className="w-3 h-3" /> Kanıt
                  </a>
                )}
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  );
};

export default Tasks;
