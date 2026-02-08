import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Users, AlertTriangle, CheckSquare, Phone, TrendingUp, Brain, Loader2 } from "lucide-react";
import { toast } from "sonner";

const AdminDashboard = () => {
  const { session } = useAuth();
  const [stats, setStats] = useState({ total: 0, active: 0, atRisk: 0, inactive: 0 });
  const [atRiskStudents, setAtRiskStudents] = useState<any[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState(0);
  const [todaySessions, setTodaySessions] = useState<any[]>([]);
  const [aiReports, setAiReports] = useState<any[]>([]);
  const [analyzing, setAnalyzing] = useState(false);

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
    supabase.from("mentor_sessions").select("*, profiles!mentor_sessions_student_id_fkey(full_name)")
      .gte("scheduled_at", today + "T00:00:00").lte("scheduled_at", today + "T23:59:59").eq("status", "scheduled")
      .then(({ data }) => setTodaySessions(data || []));

    // Fetch latest AI reports
    supabase.from("ai_analysis_reports").select("*, profiles:user_id(full_name)")
      .order("created_at", { ascending: false }).limit(10)
      .then(({ data }) => setAiReports(data || []));
  }, []);

  const runAnalysis = async () => {
    if (!session?.access_token) return;
    setAnalyzing(true);
    try {
      const res = await supabase.functions.invoke("analyze-all-students");
      if (res.error) throw new Error(res.error.message);
      const result = res.data;
      toast.success(`${result.analyzed} öğrenci analiz edildi!`);
      // Refresh reports
      const { data } = await supabase.from("ai_analysis_reports").select("*, profiles:user_id(full_name)")
        .order("created_at", { ascending: false }).limit(10);
      setAiReports(data || []);
    } catch (e: any) {
      toast.error("Analiz hatası: " + (e.message || "Bilinmeyen hata"));
    }
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
          <p className="text-sm text-muted-foreground">Henüz AI analiz raporu yok. "Tümünü Analiz Et" butonuna tıklayın.</p>
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
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">{r.analysis_date}</span>
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
