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

    // Weekly checkin trend
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

    // Payment stats
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
    if (level === "high") return "bg-destructive/20 text-destructive";
    if (level === "medium") return "bg-yellow-500/20 text-yellow-400";
    return "bg-green-500/20 text-green-400";
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border/30 p-4">
          <Users className="w-5 h-5 text-primary mb-2" />
          <p className="text-2xl font-bold text-foreground">{stats.total}</p>
          <p className="text-xs text-muted-foreground">Toplam Öğrenci</p>
        </Card>
        <Card className="bg-card border-border/30 p-4">
          <TrendingUp className="w-5 h-5 text-green-400 mb-2" />
          <p className="text-2xl font-bold text-foreground">{stats.active}</p>
          <p className="text-xs text-muted-foreground">Aktif</p>
        </Card>
        <Card className="bg-card border-border/30 p-4">
          <AlertTriangle className="w-5 h-5 text-destructive mb-2" />
          <p className="text-2xl font-bold text-foreground">{stats.atRisk}</p>
          <p className="text-xs text-muted-foreground">Risk Altında</p>
        </Card>
        <Card className="bg-card border-border/30 p-4">
          <CheckSquare className="w-5 h-5 text-primary mb-2" />
          <p className="text-2xl font-bold text-foreground">{pendingApprovals}</p>
          <p className="text-xs text-muted-foreground">Onay Bekleyen</p>
        </Card>
      </div>

      {/* Revenue + Overdue */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-card border-border/30 p-4 flex items-center gap-3">
          <DollarSign className="w-5 h-5 text-green-400" />
          <div>
            <p className="text-lg font-bold text-foreground">₺{paymentStats.total.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Toplam Gelir</p>
          </div>
        </Card>
        <Card className={`bg-card border-border/30 p-4 flex items-center gap-3 ${paymentStats.overdue > 0 ? "border-destructive/30" : ""}`}>
          <Calendar className="w-5 h-5 text-destructive" />
          <div>
            <p className="text-lg font-bold text-foreground">{paymentStats.overdue}</p>
            <p className="text-xs text-muted-foreground">Vadesi Geçmiş</p>
          </div>
        </Card>
      </div>

      {/* Weekly Checkin Trend */}
      <Card className="bg-card border-border/30 p-5">
        <h3 className="font-display text-lg text-foreground mb-4">Haftalık Check-in Trendi</h3>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={weeklyCheckins}>
            <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} />
            <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* AI Analysis */}
      <Card className="bg-card border-border/30 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            <h3 className="font-display text-lg text-foreground">AI Analiz Raporları</h3>
          </div>
          <Button onClick={runAnalysis} disabled={analyzing} size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
            {analyzing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analiz Ediliyor...</> : <><Brain className="w-4 h-4 mr-2" /> Tümünü Analiz Et</>}
          </Button>
        </div>
        {aiReports.length === 0 ? (
          <p className="text-sm text-muted-foreground">Henüz AI analiz raporu yok.</p>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {aiReports.map(r => (
              <Link key={r.id} to={`/admin/students/${r.user_id}`}
                className="flex items-center justify-between p-3 rounded-lg bg-secondary hover:bg-secondary/80 transition">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground font-medium truncate">{(r as any).profiles?.full_name || "Öğrenci"}</p>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{r.summary?.slice(0, 80)}...</p>
                </div>
                <div className="flex items-center gap-2 ml-3">
                  <Badge className={`${riskColor(r.risk_level)} text-xs`}>{r.risk_level === "high" ? "Yüksek" : r.risk_level === "medium" ? "Orta" : "Düşük"}</Badge>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border/30 p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <h3 className="font-display text-lg text-foreground">Risk Altındaki Öğrenciler</h3>
          </div>
          {atRiskStudents.length === 0 ? (
            <p className="text-sm text-muted-foreground">Risk altında öğrenci yok 👍</p>
          ) : (
            <div className="space-y-2">
              {atRiskStudents.map(s => (
                <Link key={s.id} to={`/admin/students/${s.user_id}`} className="flex items-center justify-between p-3 rounded-lg bg-secondary hover:bg-secondary/80 transition">
                  <span className="text-sm text-foreground">{s.full_name}</span>
                  <Badge className="bg-destructive/20 text-destructive">Risk</Badge>
                </Link>
              ))}
            </div>
          )}
        </Card>

        <Card className="bg-card border-border/30 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Phone className="w-5 h-5 text-primary" />
            <h3 className="font-display text-lg text-foreground">Bugünün Görüşmeleri</h3>
          </div>
          {todaySessions.length === 0 ? (
            <p className="text-sm text-muted-foreground">Bugün planlanmış görüşme yok</p>
          ) : (
            <div className="space-y-2">
              {todaySessions.map(s => (
                <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                  <span className="text-sm text-foreground">{(s as any).profiles?.full_name || "Öğrenci"}</span>
                  <span className="text-xs text-primary">{new Date(s.scheduled_at).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
