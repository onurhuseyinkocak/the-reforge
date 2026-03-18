import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, User, Flame, MessageSquare, Brain, Loader2, Image, X, Mail, ChevronDown, Send, AlertTriangle, BarChart3, MessageCircle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { toast } from "sonner";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const AdminStudentDetail = () => {
  const { id } = useParams();
  const { user, session } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [checkins, setCheckins] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [newNote, setNewNote] = useState("");
  const [aiReports, setAiReports] = useState<any[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [lifePhotos, setLifePhotos] = useState<any[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [emailDropdownOpen, setEmailDropdownOpen] = useState(false);
  const [customEmailMessage, setCustomEmailMessage] = useState("");
  const [showCustomEmail, setShowCustomEmail] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => {
    if (!id) return;
    supabase.from("profiles").select("*").eq("user_id", id).maybeSingle().then(({ data }) => setProfile(data));
    supabase.from("checkins").select("*").eq("user_id", id).order("checkin_date", { ascending: true }).limit(30).then(({ data }) => setCheckins(data || []));
    supabase.from("admin_notes").select("*").eq("student_id", id).order("created_at", { ascending: false }).then(({ data }) => setNotes(data || []));
    supabase.from("ai_analysis_reports").select("*").eq("user_id", id).order("created_at", { ascending: false }).limit(10).then(({ data }) => setAiReports(data || []));
    supabase.from("life_area_entries").select("area, entry_date, photo_urls").eq("user_id", id)
      .not("photo_urls", "eq", "[]").order("entry_date", { ascending: false }).limit(20)
      .then(({ data }) => setLifePhotos(data || []));
  }, [id]);

  const addNote = async () => {
    if (!newNote.trim() || !user || !id) return;
    const { error } = await supabase.from("admin_notes").insert({ student_id: id, admin_id: user.id, content: newNote.trim() });
    if (error) toast.error("Hata");
    else {
      toast.success("Not eklendi"); setNewNote("");
      supabase.from("admin_notes").select("*").eq("student_id", id).order("created_at", { ascending: false }).then(({ data }) => setNotes(data || []));
    }
  };

  const analyzeStudent = async () => {
    if (!session?.access_token || !id) return;
    setAnalyzing(true);
    try {
      const res = await supabase.functions.invoke("analyze-student", { body: { student_id: id } });
      if (res.error) throw new Error(res.error.message);
      toast.success("Analiz tamamlandı!");
      const { data } = await supabase.from("ai_analysis_reports").select("*").eq("user_id", id).order("created_at", { ascending: false }).limit(10);
      setAiReports(data || []);
    } catch (e: any) {
      toast.error("Analiz hatası: " + (e.message || "Bilinmeyen hata"));
    }
    setAnalyzing(false);
  };

  const sendEmailToStudent = async (template: string, customMsg?: string) => {
    if (!profile?.email && !id) return;
    setSendingEmail(true);
    try {
      // Get user email from auth (profile might not have it)
      const emailTo = profile.email || profile.full_name;
      const body: any = {
        to: emailTo,
        template,
        data: {
          name: profile.full_name,
          studentId: id,
        },
      };

      if (template === "streak_warning") {
        body.subject = "THE FORGE \u2014 Seri Uyar\u0131s\u0131";
        body.data.streak = profile.streak || 0;
      } else if (template === "weekly_summary") {
        body.subject = "THE FORGE \u2014 Haftal\u0131k \u00d6zet";
        body.data.week = profile.current_week || 1;
        body.data.phase = profile.current_phase || 1;
      } else if (template === "welcome" && customMsg) {
        body.subject = "THE FORGE \u2014 Mesaj";
        body.data.message = customMsg;
      }

      const res = await supabase.functions.invoke("send-email", { body });
      if (res.error) throw new Error(res.error.message);
      toast.success("Email g\u00f6nderildi!");
    } catch (e: any) {
      toast.error("Email hatas\u0131: " + (e.message || "Bilinmeyen hata"));
    }
    setSendingEmail(false);
    setEmailDropdownOpen(false);
    setShowCustomEmail(false);
    setCustomEmailMessage("");
  };

  const energyData = checkins.filter(c => c.energy_rating).map(c => ({ date: c.checkin_date.slice(5), energy: c.energy_rating }));
  const progressPercent = profile ? Math.round((profile.current_week / 24) * 100) : 0;

  const riskColor = (level: string) => {
    if (level === "high") return "bg-red-500/20 text-red-400 border-red-500/30";
    if (level === "medium") return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
  };

  const statusColor = (s: string) => {
    if (s === "active") return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
    if (s === "at-risk") return "bg-red-500/20 text-red-400 border-red-500/30";
    return "bg-orange-500/20 text-orange-400 border-orange-500/30";
  };

  const allPhotos = lifePhotos.flatMap(lp => ((lp.photo_urls as string[]) || []).map(url => ({ url, area: lp.area, date: lp.entry_date })));

  if (!profile) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-2 border-[#FF4500] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="relative">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-1/3 w-96 h-96 bg-[#FF4500]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-20 right-1/4 w-72 h-72 bg-purple-500/3 rounded-full blur-[100px]" />
      </div>

      <motion.div variants={container} initial="hidden" animate="show" className="relative space-y-6">
        {/* Back link */}
        <motion.div variants={item}>
          <Link to="/admin/students" className="inline-flex items-center gap-2 text-white/40 hover:text-[#FF4500] text-sm transition-colors duration-200 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Öğrencilere Dön
          </Link>
        </motion.div>

        {/* Hero Card */}
        <motion.div variants={item}>
          <Card className="relative overflow-hidden bg-white/[0.03] border-white/[0.06] backdrop-blur-xl p-7">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FF4500] to-transparent" />
            {/* Subtle hero glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF4500]/5 rounded-full blur-[80px] pointer-events-none" />

            <div className="relative flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FF4500]/20 to-[#FF4500]/5 border border-[#FF4500]/20 flex items-center justify-center shadow-[0_0_30px_rgba(255,69,0,0.15)]">
                <User className="w-8 h-8 text-[#FF4500]" />
              </div>
              <div className="flex-1">
                <h2 className="font-display text-3xl text-white tracking-wide">{profile.full_name}</h2>
                <div className="flex items-center gap-3 mt-2">
                  <Badge className={`${statusColor(profile.status)} border text-xs`}>
                    {profile.status}
                  </Badge>
                  <span className="text-sm text-white/30">Faz {profile.current_phase} · Hafta {profile.current_week}</span>
                  <span className="text-sm text-orange-400 flex items-center gap-1">
                    <Flame className="w-4 h-4" />{profile.streak}
                  </span>
                </div>
              </div>
              <Button
                onClick={analyzeStudent}
                disabled={analyzing}
                size="sm"
                className="bg-[#FF4500] hover:bg-[#FF4500]/80 text-white border-0 shadow-[0_0_20px_rgba(255,69,0,0.3)] hover:shadow-[0_0_30px_rgba(255,69,0,0.5)] transition-all duration-300"
              >
                {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Brain className="w-4 h-4 mr-1.5" /> Analiz Et</>}
              </Button>
            </div>

            {/* Progress bar */}
            <div className="mt-5 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-white/30">İlerleme</span>
                <span className="text-[#FF4500]">{progressPercent}%</span>
              </div>
              <div className="h-2 bg-white/[0.05] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                  className="h-full bg-gradient-to-r from-[#FF4500] to-[#FF4500]/60 rounded-full"
                />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* AI Reports */}
        {aiReports.length > 0 && (
          <motion.div variants={item}>
            <Card className="relative overflow-hidden bg-white/[0.03] border-white/[0.06] backdrop-blur-xl p-6">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="font-display text-lg text-white tracking-wide">AI Analiz Raporları</h3>
              </div>
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {aiReports.map((r, i) => (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.05]"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-white/25">{format(new Date(r.created_at), "d MMM yyyy HH:mm", { locale: tr })}</span>
                      <Badge className={`${riskColor(r.risk_level)} text-xs border`}>
                        {r.risk_level === "high" ? "Yüksek Risk" : r.risk_level === "medium" ? "Orta Risk" : "Düşük Risk"}
                      </Badge>
                    </div>
                    <p className="text-sm text-white/80 mb-2">{r.summary}</p>
                    {r.recommendations && (r.recommendations as any[]).length > 0 && (
                      <div className="mt-3 space-y-1.5">
                        <p className="text-xs text-white/30 font-medium">Öneriler:</p>
                        {(r.recommendations as any[]).map((rec: any, idx: number) => (
                          <div key={idx} className="flex items-start gap-2 text-xs">
                            <span className="text-[#FF4500] mt-0.5">•</span>
                            <span className="text-white/60"><strong className="text-white/80">{rec.area}:</strong> {rec.suggestion}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Energy Trend */}
        {energyData.length > 0 && (
          <motion.div variants={item}>
            <Card className="relative overflow-hidden bg-white/[0.03] border-white/[0.06] backdrop-blur-xl p-6">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FF4500] to-transparent" />
              <h3 className="font-display text-lg text-white mb-5 tracking-wide">Enerji Trendi</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={energyData}>
                  <defs>
                    <linearGradient id="energyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FF4500" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#FF4500" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="rgba(255,255,255,0.15)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 10]} stroke="rgba(255,255,255,0.15)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(15,15,15,0.95)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 12,
                      color: "#fff",
                      backdropFilter: "blur(20px)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="energy"
                    stroke="#FF4500"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 5, fill: "#FF4500", stroke: "rgba(255,69,0,0.3)", strokeWidth: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>
        )}

        {/* Life Area Photos */}
        {allPhotos.length > 0 && (
          <motion.div variants={item}>
            <Card className="relative overflow-hidden bg-white/[0.03] border-white/[0.06] backdrop-blur-xl p-6">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-sky-500 to-transparent" />
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center">
                  <Image className="w-5 h-5 text-sky-400" />
                </div>
                <h3 className="font-display text-lg text-white tracking-wide">Yaşam Alanı Fotoğrafları</h3>
              </div>
              <div className="grid grid-cols-4 md:grid-cols-6 gap-2.5">
                {allPhotos.slice(0, 18).map((p, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group border border-white/[0.06]"
                    onClick={() => setPreviewImage(p.url)}
                  >
                    <img src={p.url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-0 left-0 right-0 px-1.5 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <p className="text-[9px] text-white/80 truncate">{p.area} · {p.date}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Notes */}
        <motion.div variants={item}>
          <Card className="relative overflow-hidden bg-white/[0.03] border-white/[0.06] backdrop-blur-xl p-6">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
            <h3 className="font-display text-lg text-white mb-5 tracking-wide">Notlar</h3>
            <div className="flex gap-3 mb-5">
              <Textarea
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
                className="bg-white/[0.03] border-white/[0.06] text-white placeholder:text-white/20 focus:border-[#FF4500]/40 focus:ring-[#FF4500]/20 backdrop-blur-xl transition-all"
                rows={2}
                placeholder="Not ekle..."
              />
              <Button
                onClick={addNote}
                className="bg-[#FF4500] hover:bg-[#FF4500]/80 text-white self-end border-0 shadow-[0_0_15px_rgba(255,69,0,0.2)] hover:shadow-[0_0_25px_rgba(255,69,0,0.4)] transition-all duration-300 px-6"
              >
                Ekle
              </Button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {notes.map((n, i) => (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.05]"
                >
                  <p className="text-sm text-white/80">{n.content}</p>
                  <p className="text-xs text-white/20 mt-1.5">{format(new Date(n.created_at), "d MMM yyyy HH:mm", { locale: tr })}</p>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Message link */}
        <motion.div variants={item} className="flex items-center gap-3">
          <Link to="/admin/messages">
            <Button className="bg-white/[0.03] border border-white/[0.06] text-white/60 hover:text-[#FF4500] hover:border-[#FF4500]/30 hover:bg-[#FF4500]/5 backdrop-blur-xl transition-all duration-300">
              <MessageSquare className="w-4 h-4 mr-2" /> Mesaj G\u00f6nder
            </Button>
          </Link>

          {/* Email Dropdown */}
          <div className="relative">
            <Button
              onClick={() => setEmailDropdownOpen(!emailDropdownOpen)}
              disabled={sendingEmail}
              className="bg-white/[0.03] border border-white/[0.06] text-white/60 hover:text-[#FF4500] hover:border-[#FF4500]/30 hover:bg-[#FF4500]/5 backdrop-blur-xl transition-all duration-300"
            >
              {sendingEmail ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Mail className="w-4 h-4 mr-2" />
              )}
              Email G\u00f6nder
              <ChevronDown className={`w-3.5 h-3.5 ml-1.5 transition-transform duration-200 ${emailDropdownOpen ? "rotate-180" : ""}`} />
            </Button>

            <AnimatePresence>
              {emailDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 top-full mt-2 w-72 z-50 rounded-2xl bg-[#0a0a0a]/95 border border-white/[0.08] backdrop-blur-2xl shadow-[0_16px_48px_rgba(0,0,0,0.5)] overflow-hidden"
                >
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FF4500]/60 to-transparent" />
                  <div className="p-2">
                    <p className="px-3 py-2 text-[10px] uppercase tracking-[0.15em] text-white/25 font-medium">Email Sablonlari</p>
                    <button
                      onClick={() => sendEmailToStudent("streak_warning")}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left hover:bg-[#FF4500]/10 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                      </div>
                      <div>
                        <p className="text-sm text-white/70 group-hover:text-white/90 transition-colors">Seri Uyar\u0131s\u0131</p>
                        <p className="text-[10px] text-white/20">streak_warning</p>
                      </div>
                    </button>
                    <button
                      onClick={() => sendEmailToStudent("weekly_summary")}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left hover:bg-[#FF4500]/10 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0">
                        <BarChart3 className="w-4 h-4 text-violet-400" />
                      </div>
                      <div>
                        <p className="text-sm text-white/70 group-hover:text-white/90 transition-colors">Haftal\u0131k \u00d6zet</p>
                        <p className="text-[10px] text-white/20">weekly_summary</p>
                      </div>
                    </button>
                    <button
                      onClick={() => { setShowCustomEmail(!showCustomEmail); }}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left hover:bg-[#FF4500]/10 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#FF4500]/10 flex items-center justify-center shrink-0">
                        <MessageCircle className="w-4 h-4 text-[#FF4500]" />
                      </div>
                      <div>
                        <p className="text-sm text-white/70 group-hover:text-white/90 transition-colors">\u00d6zel Mesaj</p>
                        <p className="text-[10px] text-white/20">Serbest metin</p>
                      </div>
                    </button>

                    {showCustomEmail && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        className="px-2 pb-2 pt-1 overflow-hidden"
                      >
                        <textarea
                          value={customEmailMessage}
                          onChange={(e) => setCustomEmailMessage(e.target.value)}
                          rows={3}
                          placeholder="Mesaj\u0131n\u0131z\u0131 yaz\u0131n..."
                          className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#FF4500]/30 focus:ring-1 focus:ring-[#FF4500]/20 resize-none transition-all"
                        />
                        <Button
                          onClick={() => sendEmailToStudent("welcome", customEmailMessage)}
                          disabled={!customEmailMessage.trim() || sendingEmail}
                          size="sm"
                          className="w-full mt-2 bg-[#FF4500]/20 hover:bg-[#FF4500]/30 text-[#FF4500] border border-[#FF4500]/30 transition-all duration-300 disabled:opacity-30"
                        >
                          <Send className="w-3.5 h-3.5 mr-1.5" /> G\u00f6nder
                        </Button>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>

      {/* Image Preview Modal */}
      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4"
            onClick={() => setPreviewImage(null)}
          >
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={previewImage}
              alt=""
              className="max-w-full max-h-[80vh] rounded-2xl shadow-2xl border border-white/[0.1]"
            />
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-6 right-6 p-2.5 bg-white/[0.05] border border-white/[0.1] rounded-xl backdrop-blur-xl hover:bg-white/[0.1] transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminStudentDetail;
