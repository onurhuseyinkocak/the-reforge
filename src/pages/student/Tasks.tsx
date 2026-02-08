import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CheckCircle2, Clock, Image, Camera, X, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const statusMap: Record<string, { label: string; color: string }> = {
  pending: { label: "Bekliyor", color: "bg-yellow-500/20 text-yellow-400" },
  in_progress: { label: "Devam Ediyor", color: "bg-sky-500/20 text-sky-400" },
  submitted: { label: "Gönderildi", color: "bg-purple-500/20 text-purple-400" },
  approved: { label: "Onaylandı", color: "bg-green-500/20 text-green-400" },
  rejected: { label: "Reddedildi", color: "bg-red-500/20 text-red-400" },
};

const phaseColors = ["border-l-green-500", "border-l-orange-500", "border-l-red-500"];

type FilterType = "all" | "pending" | "in_progress" | "submitted" | "approved" | "rejected";

const Tasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchTasks = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("student_tasks").select("*, tasks(*)").eq("user_id", user.id).order("created_at", { ascending: false });
    setTasks(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchTasks(); }, [user]);

  const markComplete = async (taskId: string) => {
    setCompletingId(taskId);
    const { error } = await supabase
      .from("student_tasks").update({ status: "submitted", submitted_at: new Date().toISOString() }).eq("id", taskId);
    if (error) toast.error("Hata");
    else { toast.success("Görev tamamlandı! 🎉"); fetchTasks(); }
    setTimeout(() => setCompletingId(null), 2000);
  };

  const uploadProof = async (taskId: string, file: File) => {
    if (!user) return;
    setUploadingId(taskId);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/${taskId}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("task-proofs").upload(path, file);
    if (error) { toast.error("Yükleme hatası"); setUploadingId(null); return; }
    const { data: { publicUrl } } = supabase.storage.from("task-proofs").getPublicUrl(path);
    await supabase.from("student_tasks").update({ proof_image_url: publicUrl }).eq("id", taskId);
    setUploadingId(null);
    toast.success("Kanıt yüklendi 📸");
    fetchTasks();
  };

  const filtered = filter === "all" ? tasks : tasks.filter(t => t.status === filter);

  const filters: { key: FilterType; label: string }[] = [
    { key: "all", label: "Tümü" },
    { key: "pending", label: "Bekliyor" },
    { key: "in_progress", label: "Devam" },
    { key: "submitted", label: "Gönderildi" },
    { key: "approved", label: "Onaylı" },
    { key: "rejected", label: "Reddedildi" },
  ];

  if (loading) return <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl text-foreground">Haftalık Görevler</h2>
        <span className="text-xs text-muted-foreground">{tasks.filter(t => t.status === "approved").length}/{tasks.length} tamamlandı</span>
      </div>

      {/* Filters */}
      <div className="flex gap-1.5 flex-wrap">
        {filters.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${filter === f.key ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
            {f.label} {f.key !== "all" && <span className="ml-1 opacity-60">({tasks.filter(t => t.status === f.key).length})</span>}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card className="bg-card border-border/30 p-8 text-center">
          <p className="text-muted-foreground">Bu filtrede görev yok</p>
        </Card>
      ) : (
        <AnimatePresence>
          {filtered.map(st => {
            const phase = st.tasks?.phase || 1;
            return (
              <motion.div key={st.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} layout>
                <Card className={`bg-card border-border/30 p-4 border-l-4 ${phaseColors[Math.min(phase - 1, 2)]}`}>
                  {/* Completion animation */}
                  {completingId === st.id && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute inset-0 bg-green-500/10 rounded-xl flex items-center justify-center z-10">
                      <Sparkles className="w-8 h-8 text-green-400" />
                    </motion.div>
                  )}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="text-foreground font-medium">{st.tasks?.title || "Görev"}</h4>
                      {st.tasks?.description && <p className="text-sm text-muted-foreground mt-1">{st.tasks.description}</p>}
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <Badge className={statusMap[st.status]?.color || ""}>{statusMap[st.status]?.label}</Badge>
                        {st.tasks?.due_date && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {st.tasks.due_date}
                          </span>
                        )}
                        <Badge className="bg-secondary text-muted-foreground border-0 text-[10px]">Faz {phase}</Badge>
                      </div>
                      {st.reviewer_notes && (
                        <p className="text-xs text-muted-foreground mt-2 p-2 bg-secondary rounded">📝 {st.reviewer_notes}</p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      {(st.status === "pending" || st.status === "in_progress") && (
                        <>
                          <Button size="sm" onClick={() => markComplete(st.id)} className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs">
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Tamamla
                          </Button>
                          <label className="cursor-pointer">
                            <input type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) uploadProof(st.id, e.target.files[0]); }} />
                            <div className="flex items-center gap-1 text-xs text-primary hover:underline justify-center">
                              {uploadingId === st.id ? <div className="w-3 h-3 border border-primary border-t-transparent rounded-full animate-spin" /> : <Camera className="w-3 h-3" />}
                              Kanıt Yükle
                            </div>
                          </label>
                        </>
                      )}
                      {st.proof_image_url && (
                        <a href={st.proof_image_url} target="_blank" className="text-xs text-primary flex items-center gap-1">
                          <Image className="w-3 h-3" /> Kanıt
                        </a>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      )}
    </div>
  );
};

export default Tasks;
