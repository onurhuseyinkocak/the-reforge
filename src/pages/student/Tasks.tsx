import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CheckCircle2, Clock, Image, Camera, X, Sparkles, Flame, Upload, ListChecks, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const statusMap: Record<string, { label: string; color: string; glow: string }> = {
  pending: { label: "Bekliyor", color: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/20", glow: "shadow-yellow-500/10" },
  in_progress: { label: "Devam Ediyor", color: "bg-sky-500/15 text-sky-400 border border-sky-500/20", glow: "shadow-sky-500/10" },
  submitted: { label: "Gönderildi", color: "bg-purple-500/15 text-purple-400 border border-purple-500/20", glow: "shadow-purple-500/10" },
  approved: { label: "Onaylandı", color: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20", glow: "shadow-emerald-500/10" },
  rejected: { label: "Reddedildi", color: "bg-red-500/15 text-red-400 border border-red-500/20", glow: "shadow-red-500/10" },
};

const phaseConfig = [
  { border: "from-emerald-500", bg: "emerald", label: "Foundation", accent: "#10b981" },
  { border: "from-orange-500", bg: "orange", label: "Pressure", accent: "#f97316" },
  { border: "from-red-500", bg: "red", label: "Tempering", accent: "#ef4444" },
];

type FilterType = "all" | "pending" | "in_progress" | "submitted" | "approved" | "rejected";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

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

  const completedCount = tasks.filter(t => t.status === "approved").length;
  const completionPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="relative">
          <div className="w-10 h-10 border-2 border-[#FF4500]/30 border-t-[#FF4500] rounded-full animate-spin" />
          <div className="absolute inset-0 w-10 h-10 border-2 border-transparent border-b-[#FF4500]/20 rounded-full animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen space-y-6 pb-8">
      {/* Background glow orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-20 -left-32 w-64 h-64 bg-[#FF4500]/[0.04] rounded-full blur-[100px]" />
        <div className="absolute bottom-40 -right-32 w-80 h-80 bg-orange-500/[0.03] rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#FF4500]/[0.02] rounded-full blur-[150px]" />
      </div>

      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-xl p-6"
      >
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FF4500] to-transparent" />
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#FF4500]/[0.06] rounded-full blur-[60px]" />

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#FF4500]/20 to-orange-600/10 flex items-center justify-center border border-[#FF4500]/20">
                <ListChecks className="w-5 h-5 text-[#FF4500]" />
              </div>
              <div className="absolute -inset-1 bg-[#FF4500]/10 rounded-xl blur-md -z-10" />
            </div>
            <div>
              <h2 className="font-display text-2xl text-white tracking-wide">Haftalık Görevler</h2>
              <p className="text-xs text-white/40 mt-0.5">Forge yolculuğundaki görevlerin</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Circular progress indicator */}
            <div className="relative w-14 h-14">
              <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                <circle cx="28" cy="28" r="24" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
                <circle
                  cx="28" cy="28" r="24" fill="none"
                  stroke="url(#taskGrad)" strokeWidth="3" strokeLinecap="round"
                  strokeDasharray={`${(completionPercent / 100) * 150.8} 150.8`}
                />
                <defs>
                  <linearGradient id="taskGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#FF4500" />
                    <stop offset="100%" stopColor="#FF6B35" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-sm font-bold text-white">{completedCount}</span>
                <span className="text-[9px] text-white/40">/{tasks.length}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filter Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex gap-2 flex-wrap"
      >
        {filters.map((f, i) => {
          const count = f.key === "all" ? tasks.length : tasks.filter(t => t.status === f.key).length;
          const isActive = filter === f.key;
          return (
            <motion.button
              key={f.key}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setFilter(f.key)}
              className={`relative px-4 py-2 rounded-xl text-xs font-medium transition-all duration-300 ${
                isActive
                  ? "bg-[#FF4500]/15 text-[#FF4500] border border-[#FF4500]/25 shadow-lg shadow-[#FF4500]/10"
                  : "bg-white/[0.03] text-white/40 border border-white/[0.06] hover:text-white/60 hover:border-white/[0.1]"
              }`}
            >
              {isActive && <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#FF4500]/60 to-transparent" />}
              {f.label}
              <span className={`ml-1.5 text-[10px] ${isActive ? "text-[#FF4500]/60" : "text-white/20"}`}>
                {count}
              </span>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Task List */}
      {filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-xl p-12 text-center"
        >
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-40 h-40 bg-[#FF4500]/[0.04] rounded-full blur-[60px]" />
          </div>
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
              <Flame className="w-8 h-8 text-white/20" />
            </div>
            <p className="text-white/40 text-sm">Bu filtrede görev yok</p>
            <p className="text-white/20 text-xs mt-1">Forge ateşi yanmaya devam ediyor</p>
          </div>
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-3"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((st, index) => {
              const phase = st.tasks?.phase || 1;
              const phaseIdx = Math.min(phase - 1, 2);
              const pc = phaseConfig[phaseIdx];
              const status = statusMap[st.status];

              return (
                <motion.div
                  key={st.id}
                  variants={itemVariants}
                  exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                  layout
                  whileHover={{ y: -2, transition: { duration: 0.2 } }}
                  className="group relative"
                >
                  <div className="relative overflow-hidden rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-xl transition-all duration-300 group-hover:bg-white/[0.05] group-hover:border-white/[0.1]">
                    {/* Top accent line with phase color */}
                    <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent ${pc.border} to-transparent opacity-60 group-hover:opacity-100 transition-opacity`} />

                    {/* Subtle phase glow */}
                    <div className="absolute -top-10 left-1/4 w-32 h-16 rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ backgroundColor: `${pc.accent}10` }} />

                    {/* Completion celebration overlay */}
                    <AnimatePresence>
                      {completingId === st.id && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl"
                        >
                          <div className="absolute inset-0 bg-emerald-500/10 backdrop-blur-sm rounded-2xl" />
                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 200 }}
                            className="relative"
                          >
                            <Sparkles className="w-12 h-12 text-emerald-400" />
                            <div className="absolute -inset-4 bg-emerald-400/20 rounded-full blur-xl" />
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="relative p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          {/* Phase indicator + Title */}
                          <div className="flex items-center gap-2.5 mb-2">
                            <div
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: pc.accent, boxShadow: `0 0 8px ${pc.accent}60` }}
                            />
                            <h4 className="text-white font-medium text-[15px] truncate">
                              {st.tasks?.title || "Görev"}
                            </h4>
                          </div>

                          {st.tasks?.description && (
                            <p className="text-sm text-white/40 leading-relaxed ml-[18px] mb-3 line-clamp-2">
                              {st.tasks.description}
                            </p>
                          )}

                          {/* Meta row */}
                          <div className="flex items-center gap-2.5 ml-[18px] flex-wrap">
                            <Badge className={`${status?.color} text-[11px] px-2.5 py-0.5 rounded-lg shadow-sm ${status?.glow}`}>
                              {status?.label}
                            </Badge>

                            {st.tasks?.due_date && (
                              <span className="text-[11px] text-white/30 flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {st.tasks.due_date}
                              </span>
                            )}

                            <span
                              className="text-[10px] px-2 py-0.5 rounded-md border"
                              style={{
                                color: `${pc.accent}cc`,
                                backgroundColor: `${pc.accent}10`,
                                borderColor: `${pc.accent}20`,
                              }}
                            >
                              Faz {phase}
                            </span>
                          </div>

                          {/* Reviewer notes */}
                          {st.reviewer_notes && (
                            <div className="mt-3 ml-[18px] p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                              <p className="text-xs text-white/50 leading-relaxed">
                                <span className="text-white/30 mr-1">Not:</span> {st.reviewer_notes}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2.5 shrink-0">
                          {(st.status === "pending" || st.status === "in_progress") && (
                            <>
                              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button
                                  size="sm"
                                  onClick={() => markComplete(st.id)}
                                  className="bg-gradient-to-r from-[#FF4500] to-orange-600 hover:from-[#FF5500] hover:to-orange-500 text-white text-xs rounded-xl px-4 py-2 shadow-lg shadow-[#FF4500]/20 border-0"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Tamamla
                                </Button>
                              </motion.div>

                              <label className="cursor-pointer group/upload">
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={e => { if (e.target.files?.[0]) uploadProof(st.id, e.target.files[0]); }}
                                />
                                <motion.div
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  className="flex items-center gap-1.5 text-xs text-white/40 hover:text-[#FF4500] transition-colors justify-center py-1.5 px-3 rounded-xl border border-white/[0.06] hover:border-[#FF4500]/30 bg-white/[0.02] hover:bg-[#FF4500]/5"
                                >
                                  {uploadingId === st.id ? (
                                    <div className="w-3 h-3 border-2 border-[#FF4500]/30 border-t-[#FF4500] rounded-full animate-spin" />
                                  ) : (
                                    <Upload className="w-3 h-3" />
                                  )}
                                  Kanıt
                                </motion.div>
                              </label>
                            </>
                          )}

                          {st.proof_image_url && (
                            <motion.a
                              href={st.proof_image_url}
                              target="_blank"
                              whileHover={{ scale: 1.05 }}
                              className="flex items-center gap-1.5 text-xs text-[#FF4500]/70 hover:text-[#FF4500] transition-colors justify-center py-1.5 px-3 rounded-xl border border-[#FF4500]/15 bg-[#FF4500]/5"
                            >
                              <Image className="w-3 h-3" /> Kanıt
                            </motion.a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};

export default Tasks;
