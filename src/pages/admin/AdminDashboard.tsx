import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Users, AlertTriangle, CheckSquare, Phone, TrendingUp } from "lucide-react";

const AdminDashboard = () => {
  const [stats, setStats] = useState({ total: 0, active: 0, atRisk: 0, inactive: 0 });
  const [atRiskStudents, setAtRiskStudents] = useState<any[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState(0);
  const [todaySessions, setTodaySessions] = useState<any[]>([]);

  useEffect(() => {
    // Fetch profiles
    supabase.from("profiles").select("*").then(({ data }) => {
      const profiles = data || [];
      setStats({
        total: profiles.length,
        active: profiles.filter(p => p.status === "active").length,
        atRisk: profiles.filter(p => p.status === "at-risk").length,
        inactive: profiles.filter(p => p.status === "inactive").length,
      });
      setAtRiskStudents(profiles.filter(p => p.status === "at-risk").slice(0, 5));
    });

    // Pending task approvals
    supabase.from("student_tasks").select("id").eq("status", "submitted").then(({ data }) => {
      setPendingApprovals(data?.length || 0);
    });

    // Today's calls
    const today = new Date().toISOString().split("T")[0];
    supabase.from("mentor_sessions").select("*, profiles!mentor_sessions_student_id_fkey(full_name)")
      .gte("scheduled_at", today + "T00:00:00")
      .lte("scheduled_at", today + "T23:59:59")
      .eq("status", "scheduled")
      .then(({ data }) => setTodaySessions(data || []));
  }, []);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-[#0D1B2A] border-white/10 p-4">
          <Users className="w-5 h-5 text-[#00A3FF] mb-2" />
          <p className="text-2xl font-bold text-white">{stats.total}</p>
          <p className="text-xs text-[#F0F4F8]/50">Toplam Öğrenci</p>
        </Card>
        <Card className="bg-[#0D1B2A] border-white/10 p-4">
          <TrendingUp className="w-5 h-5 text-green-400 mb-2" />
          <p className="text-2xl font-bold text-white">{stats.active}</p>
          <p className="text-xs text-[#F0F4F8]/50">Aktif</p>
        </Card>
        <Card className="bg-[#0D1B2A] border-white/10 p-4">
          <AlertTriangle className="w-5 h-5 text-orange-400 mb-2" />
          <p className="text-2xl font-bold text-white">{stats.atRisk}</p>
          <p className="text-xs text-[#F0F4F8]/50">Risk Altında</p>
        </Card>
        <Card className="bg-[#0D1B2A] border-white/10 p-4">
          <CheckSquare className="w-5 h-5 text-purple-400 mb-2" />
          <p className="text-2xl font-bold text-white">{pendingApprovals}</p>
          <p className="text-xs text-[#F0F4F8]/50">Onay Bekleyen</p>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* At-risk students */}
        <Card className="bg-[#0D1B2A] border-white/10 p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-orange-400" />
            <h3 className="font-display text-lg text-white">Risk Altındaki Öğrenciler</h3>
          </div>
          {atRiskStudents.length === 0 ? (
            <p className="text-sm text-[#F0F4F8]/40">Risk altında öğrenci yok 👍</p>
          ) : (
            <div className="space-y-2">
              {atRiskStudents.map(s => (
                <Link key={s.id} to={`/admin/students/${s.user_id}`} className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition">
                  <span className="text-sm text-white">{s.full_name}</span>
                  <Badge className="bg-orange-500/20 text-orange-400">Risk</Badge>
                </Link>
              ))}
            </div>
          )}
        </Card>

        {/* Today's calls */}
        <Card className="bg-[#0D1B2A] border-white/10 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Phone className="w-5 h-5 text-[#00A3FF]" />
            <h3 className="font-display text-lg text-white">Bugünün Görüşmeleri</h3>
          </div>
          {todaySessions.length === 0 ? (
            <p className="text-sm text-[#F0F4F8]/40">Bugün planlanmış görüşme yok</p>
          ) : (
            <div className="space-y-2">
              {todaySessions.map(s => (
                <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <span className="text-sm text-white">{(s as any).profiles?.full_name || "Öğrenci"}</span>
                  <span className="text-xs text-[#00A3FF]">{new Date(s.scheduled_at).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}</span>
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
