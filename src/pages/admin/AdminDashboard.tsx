import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Users, AlertTriangle, CheckSquare, Phone, TrendingUp, Brain, Loader2, DollarSign, Calendar } from "lucide-react";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const AnimatedCounter = ({ value }: { value: number }) => {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (value === 0) return;
    let start = 0;
    const step = Math.max(1, Math.floor(value / 30));
    const interval = setInterval(() => {
      start += step;
      if (start >= value) { setDisplay(value); clearInterval(interval); }
      else setDisplay(start);
    }, 30);
    return () => clearInterval(interval);
  }, [value]);
  return <>{display.toLocaleString()}</>;
};

const AdminDashboard = () => {
  const { session } = useAuth();
  const [stats, setStats] = useState({ total: 0, active: 0, atRisk: 0, inactive: 0 });
  const [atRiskStudents, setAtRiskStudents] = useState<any[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState(0);
  const [todaySessions, setTodaySessions] = useState<any[]>([]);
  const [aiReports, setAiReports] = useState<any[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [weeklyCheckins, setWeeklyCheckins] = useState<{ day: string; count: number }[]>([]);
  const [paymentStats, setPaymentStats] = useState({ total: 0, overdue: 0 });

  useEffect(() => {
    supabase.from("profiles").select("*").then(({ data }) => {
      const profiles = data || [];
      setStats({
        total: profiles.length, active: profiles.filter(p => p.status === "active").length,
        atRisk: profiles.filter(p => p.status === "at-risk").length, inactive: profiles.filter(p => p.status === "inactive").length,
      });
      setAtRiskStudents(profiles.filter(p => p.status === "at-risk").slice(0, 5));
    });
    supabase.from("student_tasks").select("id").eq("status", "submitted").then(({ data }) => setPendingApprovals(data?.length || 0));
    const today = new Date().toISOString().split("T")[0];
    supabase.from("mentor_sessions").select("*")
      .gte("scheduled_at", today + "T00:00:00").lte("scheduled_at", today + "T23:59:59").eq("status", "scheduled")
      .then(({ data }) => setTodaySessions(data || []));
    supabase.from("ai_analysis_reports").select("*")
      .order("created_at", { ascending: false }).limit(10)
      .then(async ({ data }) => {
        const reports = data || [];
        if (reports.length > 0) {
          const userIds = [...new Set(reports.map(r => r.user_id))];
          const { data: profiles } = await supabase.from("profiles").select("user_id, full_name").in("user_id", userIds);
          const nameMap: Record<string, string> = {};
          (profiles || []).forEach(p => { nameMap[p.user_id] = p.full_name; });
          reports.forEach((r: any) => { r.profiles = { full_name: nameMap[r.user_id] || "Kullanıcı" }; });
        }
        setAiReports(reports);
      });

    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
    supabase.from("checkins").select("checkin_date").gte("checkin_date", weekAgo).then(({ data }) => {
      const counts: Record<string, number> = {};
      (data || []).forEach(d => { counts[d.checkin_date] = (counts[d.checkin_date] || 0) + 1; });
      const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(Date.now() - (6 - i) * 86400000);
        const key = d.toISOString().slice(0, 10);
        return { day: key.slice(5), count: counts[key] || 0 };
      });
      setWeeklyCheckins(days);
    });

    supabase.from("payments").select("amount, status, due_date").then(({ data }) => {
      const total = (data || []).filter(p => p.status === "paid").reduce((s, p) => s + Number(p.amount), 0);
      const overdue = (data || []).filter(p => p.status === "pending" && p.due_date < today).length;
      setPaymentStats({ total, overdue });
    });
  }, []);

  const runAnalysis = async () => {
    if (!session?.access_token) return;
    setAnalyzing(true);
    try {
      const res = await supabase.functions.invoke("analyze-all-students");
      if (res.error) throw new Error(res.error.message);
      toast.success(`${res.data.analyzed} öğrenci analiz edildi!`);
      const { data } = await supabase.from("ai_analysis_reports").select("*")
        .order("created_at", { ascending: false }).limit(10);
      const reports = data || [];
      if (reports.length > 0) {
        const userIds = [...new Set(reports.map(r => r.user_id))];
        const { data: profiles } = await supabase.from("profiles").select("user_id, full_name").in("user_id", userIds);
        const nameMap: Record<string, string> = {};
        (profiles || []).forEach(p => { nameMap[p.user_id] = p.full_name; });
        reports.forEach((r: any) => { r.profiles = { full_name: nameMap[r.user_id] || "Kullanıcı" }; });
      }
      setAiReports(reports);
    } catch (e: any) { toast.error("Analiz hatası: " + (e.message || "Bilinmeyen hata")); }
    setAnalyzing(false);
  };

  const riskColor = (level: string) => {
    if (level === "high") return "bg-red-500/20 text-red-400 border-red-500/30";
    if (level === "medium") return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
  };

  const statCards = [
    { icon: Users, label: "Toplam Öğrenci", value: stats.total, color: "#FF4500", glow: "shadow-[0_0_30px_rgba(255,69,0,0.15)]" },
    { icon: TrendingUp, label: "Aktif", value: stats.active, color: "#22c55e", glow: "shadow-[0_0_30px_rgba(34,197,94,0.15)]" },
    { icon: AlertTriangle, label: "Risk Altında", value: stats.atRisk, color: "#ef4444", glow: "shadow-[0_0_30px_rgba(239,68,68,0.15)]" },
    { icon: CheckSquare, label: "Onay Bekleyen", value: pendingApprovals, color: "#FF4500", glow: "shadow-[0_0_30px_rgba(255,69,0,0.15)]" },
  ];

  return (
    <div className="relative min-h-screen">
      {/* Background glow orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-[#FF4500]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-40 right-1/4 w-80 h-80 bg-[#FF4500]/3 rounded-full blur-[100px]" />
      </div>

      <motion.div variants={container} initial="hidden" animate="show" className="relative space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card, i) => (
            <motion.div key={i} variants={item} whileHover={{ y: -2 }}>
              <Card className={`relative overflow-hidden bg-white/[0.03] border-white/[0.06] backdrop-blur-xl p-5 ${card.glow} transition-all duration-300`}>
                <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, transparent, ${card.color}, transparent)` }} />
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${card.color}15` }}>
                    <card.icon className="w-5 h-5" style={{ color: card.color }} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white font-display tracking-wide">
                      <AnimatedCounter value={card.value} />
                    </p>
                    <p className="text-xs text-white/40">{card.label}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Revenue + Overdue */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div variants={item} whileHover={{ y: -2 }}>
            <Card className="relative overflow-hidden bg-white/[0.03] border-white/[0.06] backdrop-blur-xl p-5 shadow-[0_0_30px_rgba(34,197,94,0.1)]">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-xl font-bold text-white font-display tracking-wide">
                    ₺<AnimatedCounter value={paymentStats.total} />
                  </p>
                  <p className="text-xs text-white/40">Toplam Gelir</p>
                </div>
              </div>
            </Card>
          </motion.div>
          <motion.div variants={item} whileHover={{ y: -2 }}>
            <Card className={`relative overflow-hidden bg-white/[0.03] border-white/[0.06] backdrop-blur-xl p-5 ${paymentStats.overdue > 0 ? "shadow-[0_0_30px_rgba(239,68,68,0.15)] border-red-500/20" : ""}`}>
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-red-500 to-transparent" />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <p className="text-xl font-bold text-white font-display tracking-wide">{paymentStats.overdue}</p>
                  <p className="text-xs text-white/40">Vadesi Geçmiş</p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Weekly Checkin Trend */}
        <motion.div variants={item}>
          <Card className="relative overflow-hidden bg-white/[0.03] border-white/[0.06] backdrop-blur-xl p-6">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FF4500] to-transparent" />
            <h3 className="font-display text-lg text-white mb-5 tracking-wide">Haftalık Check-in Trendi</h3>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={weeklyCheckins}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF4500" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#FF4500" stopOpacity={0.3} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="rgba(255,255,255,0.25)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.25)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15,15,15,0.95)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 12,
                    color: "#fff",
                    backdropFilter: "blur(20px)",
                  }}
                  cursor={{ fill: "rgba(255,69,0,0.05)" }}
                />
                <Bar dataKey="count" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        {/* AI Analysis */}
        <motion.div variants={item}>
          <Card className="relative overflow-hidden bg-white/[0.03] border-white/[0.06] backdrop-blur-xl p-6">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="font-display text-lg text-white tracking-wide">AI Analiz Raporları</h3>
              </div>
              <Button
                onClick={runAnalysis}
                disabled={analyzing}
                size="sm"
                className="bg-[#FF4500] hover:bg-[#FF4500]/80 text-white border-0 shadow-[0_0_20px_rgba(255,69,0,0.3)] hover:shadow-[0_0_30px_rgba(255,69,0,0.5)] transition-all duration-300"
              >
                {analyzing ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analiz Ediliyor...</>
                ) : (
                  <><Brain className="w-4 h-4 mr-2" /> Tümünü Analiz Et</>
                )}
              </Button>
            </div>
            {aiReports.length === 0 ? (
              <p className="text-sm text-white/30">Henüz AI analiz raporu yok.</p>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
                {aiReports.map((r, i) => (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      to={`/admin/students/${r.user_id}`}
                      className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06] hover:border-white/[0.1] transition-all duration-200 group"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-medium truncate group-hover:text-[#FF4500] transition-colors">
                          {(r as any).profiles?.full_name || "Öğrenci"}
                        </p>
                        <p className="text-xs text-white/30 truncate mt-0.5">{r.summary?.slice(0, 80)}...</p>
                      </div>
                      <div className="flex items-center gap-2 ml-3">
                        <Badge className={`${riskColor(r.risk_level)} text-xs border`}>
                          {r.risk_level === "high" ? "Yüksek" : r.risk_level === "medium" ? "Orta" : "Düşük"}
                        </Badge>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>

        {/* At-risk + Today's Sessions */}
        <div className="grid lg:grid-cols-2 gap-6">
          <motion.div variants={item}>
            <Card className="relative overflow-hidden bg-white/[0.03] border-white/[0.06] backdrop-blur-xl p-6 h-full">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-red-500 to-transparent" />
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <h3 className="font-display text-lg text-white tracking-wide">Risk Altındaki Öğrenciler</h3>
              </div>
              {atRiskStudents.length === 0 ? (
                <p className="text-sm text-white/30">Risk altında öğrenci yok</p>
              ) : (
                <div className="space-y-2">
                  {atRiskStudents.map((s, i) => (
                    <motion.div
                      key={s.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Link
                        to={`/admin/students/${s.user_id}`}
                        className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:bg-red-500/5 hover:border-red-500/20 transition-all duration-200 group"
                      >
                        <span className="text-sm text-white group-hover:text-red-400 transition-colors">{s.full_name}</span>
                        <Badge className="bg-red-500/20 text-red-400 border border-red-500/30">Risk</Badge>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="relative overflow-hidden bg-white/[0.03] border-white/[0.06] backdrop-blur-xl p-6 h-full">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FF4500] to-transparent" />
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-[#FF4500]/10 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-[#FF4500]" />
                </div>
                <h3 className="font-display text-lg text-white tracking-wide">Bugünün Görüşmeleri</h3>
              </div>
              {todaySessions.length === 0 ? (
                <p className="text-sm text-white/30">Bugün planlanmış görüşme yok</p>
              ) : (
                <div className="space-y-2">
                  {todaySessions.map((s, i) => (
                    <motion.div
                      key={s.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                        <span className="text-sm text-white">{(s as any).profiles?.full_name || "Öğrenci"}</span>
                        <span className="text-xs text-[#FF4500] font-medium bg-[#FF4500]/10 px-2.5 py-1 rounded-lg">
                          {new Date(s.scheduled_at).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
