import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Check, X, ListTodo, ClipboardCheck, Archive } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" as const } },
} as const;

const AdminTasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [pendingSubmissions, setPendingSubmissions] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [phase, setPhase] = useState(1);
  const [week, setWeek] = useState(1);
  const [creating, setCreating] = useState(false);

  const fetchData = async () => {
    const { data: t } = await supabase.from("tasks").select("*").order("created_at", { ascending: false });
    setTasks(t || []);
    const { data: s } = await supabase.from("student_tasks").select("*, tasks(*), profiles!student_tasks_user_id_fkey(full_name)")
      .eq("status", "submitted").order("submitted_at", { ascending: false });
    setPendingSubmissions(s || []);
  };

  useEffect(() => { fetchData(); }, []);

  const createTask = async () => {
    if (!title.trim()) { toast.error("Başlık gerekli"); return; }
    setCreating(true);
    const { error } = await supabase.from("tasks").insert({ title: title.trim(), description: description.trim(), phase, week, created_by: user?.id });
    setCreating(false);
    if (error) toast.error("Hata");
    else { toast.success("Görev oluşturuldu!"); setTitle(""); setDescription(""); fetchData(); }
  };

  const reviewSubmission = async (id: string, approve: boolean, notes?: string) => {
    const { error } = await supabase.from("student_tasks").update({
      status: approve ? "approved" : "rejected", reviewed_at: new Date().toISOString(),
      reviewer_notes: notes || (approve ? "Onaylandı" : "Tekrar gönder"),
    }).eq("id", id);
    if (error) toast.error("Hata");
    else { toast.success(approve ? "Onaylandı!" : "Reddedildi"); fetchData(); }
  };

  return (
    <div className="relative">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-32 right-1/3 w-80 h-80 bg-[#FF4500]/5 rounded-full blur-[120px]" />
      </div>

      <motion.div variants={container} initial="hidden" animate="show" className="relative space-y-6">
        <Tabs defaultValue="create">
          <motion.div variants={item}>
            <TabsList className="bg-white/[0.03] border border-white/[0.06] backdrop-blur-xl p-1 rounded-xl">
              <TabsTrigger
                value="create"
                className="data-[state=active]:bg-[#FF4500]/20 data-[state=active]:text-[#FF4500] data-[state=active]:shadow-[0_0_15px_rgba(255,69,0,0.15)] text-white/40 rounded-lg transition-all duration-300 gap-2"
              >
                <Plus className="w-4 h-4" /> Görev Oluştur
              </TabsTrigger>
              <TabsTrigger
                value="queue"
                className="data-[state=active]:bg-[#FF4500]/20 data-[state=active]:text-[#FF4500] data-[state=active]:shadow-[0_0_15px_rgba(255,69,0,0.15)] text-white/40 rounded-lg transition-all duration-300 gap-2"
              >
                <ClipboardCheck className="w-4 h-4" /> Onay Bekleyen ({pendingSubmissions.length})
              </TabsTrigger>
              <TabsTrigger
                value="all"
                className="data-[state=active]:bg-[#FF4500]/20 data-[state=active]:text-[#FF4500] data-[state=active]:shadow-[0_0_15px_rgba(255,69,0,0.15)] text-white/40 rounded-lg transition-all duration-300 gap-2"
              >
                <Archive className="w-4 h-4" /> Tüm Görevler
              </TabsTrigger>
            </TabsList>
          </motion.div>

          <TabsContent value="create">
            <motion.div variants={item}>
              <Card className="relative overflow-hidden bg-white/[0.03] border-white/[0.06] backdrop-blur-xl p-7 space-y-5">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FF4500] to-transparent" />

                <div className="space-y-2">
                  <Label className="text-white/50 text-xs uppercase tracking-wider">Görev Başlığı</Label>
                  <Input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="bg-white/[0.03] border-white/[0.06] text-white placeholder:text-white/20 focus:border-[#FF4500]/40 focus:ring-[#FF4500]/20 backdrop-blur-xl transition-all h-11"
                    placeholder="Görev başlığını girin..."
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white/50 text-xs uppercase tracking-wider">Açıklama</Label>
                  <Textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="bg-white/[0.03] border-white/[0.06] text-white placeholder:text-white/20 focus:border-[#FF4500]/40 focus:ring-[#FF4500]/20 backdrop-blur-xl transition-all"
                    rows={3}
                    placeholder="Görev açıklamasını girin..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className="text-white/50 text-xs uppercase tracking-wider">Faz</Label>
                    <Input
                      type="number"
                      min={1}
                      max={3}
                      value={phase}
                      onChange={e => setPhase(Number(e.target.value))}
                      className="bg-white/[0.03] border-white/[0.06] text-white focus:border-[#FF4500]/40 focus:ring-[#FF4500]/20 backdrop-blur-xl transition-all h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/50 text-xs uppercase tracking-wider">Hafta</Label>
                    <Input
                      type="number"
                      min={1}
                      max={24}
                      value={week}
                      onChange={e => setWeek(Number(e.target.value))}
                      className="bg-white/[0.03] border-white/[0.06] text-white focus:border-[#FF4500]/40 focus:ring-[#FF4500]/20 backdrop-blur-xl transition-all h-11"
                    />
                  </div>
                </div>

                <Button
                  onClick={createTask}
                  disabled={creating}
                  className="bg-[#FF4500] hover:bg-[#FF4500]/80 text-white border-0 shadow-[0_0_20px_rgba(255,69,0,0.3)] hover:shadow-[0_0_30px_rgba(255,69,0,0.5)] transition-all duration-300 h-11 px-6"
                >
                  <Plus className="w-4 h-4 mr-2" /> {creating ? "Oluşturuluyor..." : "Görev Oluştur"}
                </Button>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="queue">
            {pendingSubmissions.length === 0 ? (
              <motion.div variants={item}>
                <Card className="relative overflow-hidden bg-white/[0.03] border-white/[0.06] backdrop-blur-xl p-12 text-center">
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />
                  <ClipboardCheck className="w-10 h-10 text-white/10 mx-auto mb-3" />
                  <p className="text-white/30">Onay bekleyen görev yok</p>
                </Card>
              </motion.div>
            ) : (
              <div className="space-y-3">
                {pendingSubmissions.map((s, i) => (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ y: -2 }}
                  >
                    <Card className="relative overflow-hidden bg-white/[0.03] border-white/[0.06] backdrop-blur-xl p-5">
                      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-yellow-500 to-transparent" />
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="text-white font-medium">{s.tasks?.title}</p>
                          <p className="text-sm text-white/30 mt-0.5">{(s as any).profiles?.full_name || "Öğrenci"}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => reviewSubmission(s.id, true)}
                            className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 hover:shadow-[0_0_15px_rgba(34,197,94,0.2)] transition-all duration-300"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => reviewSubmission(s.id, false)}
                            className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 hover:shadow-[0_0_15px_rgba(239,68,68,0.2)] transition-all duration-300"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="all">
            <div className="space-y-2">
              {tasks.map((t, i) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  whileHover={{ y: -2 }}
                >
                  <Card className="relative overflow-hidden bg-white/[0.03] border-white/[0.06] backdrop-blur-xl p-4 flex items-center justify-between group hover:border-white/[0.1] transition-all duration-300">
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#FF4500]/10 flex items-center justify-center">
                        <ListTodo className="w-4 h-4 text-[#FF4500]" />
                      </div>
                      <div>
                        <p className="text-white group-hover:text-[#FF4500] transition-colors">{t.title}</p>
                        <p className="text-xs text-white/25 mt-0.5">Faz {t.phase} · Hafta {t.week}</p>
                      </div>
                    </div>
                    <Badge className="bg-white/[0.05] text-white/30 border border-white/[0.06] text-xs">
                      F{t.phase}/H{t.week}
                    </Badge>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default AdminTasks;
