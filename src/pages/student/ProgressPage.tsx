import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Flame, TrendingUp, CheckCircle2, Calendar } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

const ProgressPage = () => {
  const { user, profile } = useAuth();
  const [checkins, setCheckins] = useState<any[]>([]);
  const [taskStats, setTaskStats] = useState({ total: 0, completed: 0 });

  useEffect(() => {
    if (!user) return;
    supabase.from("checkins").select("*").eq("user_id", user.id).order("checkin_date", { ascending: true }).limit(60).then(({ data }) => {
      setCheckins(data || []);
    });
    supabase.from("student_tasks").select("status").eq("user_id", user.id).then(({ data }) => {
      const total = data?.length || 0;
      const completed = data?.filter(t => t.status === "approved").length || 0;
      setTaskStats({ total, completed });
    });
  }, [user]);

  const totalWeeks = 24;
  const currentWeek = profile?.current_week || 1;
  const progressPercent = Math.round((currentWeek / totalWeeks) * 100);

  const phases = [
    { name: "The Foundation", weeks: "1-8", active: (profile?.current_phase || 1) >= 1 },
    { name: "The Pressure", weeks: "9-16", active: (profile?.current_phase || 1) >= 2 },
    { name: "The Tempering", weeks: "17-24", active: (profile?.current_phase || 1) >= 3 },
  ];

  // Energy trend data
  const energyData = checkins.filter(c => c.energy_rating).map(c => ({
    date: c.checkin_date.slice(5),
    energy: c.energy_rating,
    sleep: c.sleep_rating,
  }));

  // Checkin rate (last 14 days)
  const uniqueDays = new Set(checkins.map(c => c.checkin_date)).size;
  const checkinRate = Math.min(100, Math.round((uniqueDays / 14) * 100));

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <Card className="bg-[#0D1B2A] border-white/10 p-6">
        <h3 className="font-display text-xl text-white mb-4">24 Haftalık İlerleme</h3>
        <Progress value={progressPercent} className="h-3 bg-white/10 mb-3" />
        <div className="flex justify-between text-sm">
          <span className="text-[#F0F4F8]/50">Hafta {currentWeek}/{totalWeeks}</span>
          <span className="text-[#00A3FF] font-bold">{progressPercent}%</span>
        </div>
      </Card>

      {/* Phase Visualization */}
      <div className="grid grid-cols-3 gap-3">
        {phases.map((p, i) => (
          <Card key={i} className={`border p-4 text-center ${p.active ? "bg-[#00A3FF]/10 border-[#00A3FF]/30" : "bg-[#0D1B2A] border-white/10"}`}>
            <p className={`font-display text-lg ${p.active ? "text-[#00A3FF]" : "text-[#F0F4F8]/30"}`}>{p.name}</p>
            <p className="text-xs text-[#F0F4F8]/40 mt-1">Hafta {p.weeks}</p>
          </Card>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-[#0D1B2A] border-white/10 p-4 text-center">
          <Flame className="w-6 h-6 text-orange-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{profile?.streak || 0}</p>
          <p className="text-xs text-[#F0F4F8]/50">Gün Serisi</p>
        </Card>
        <Card className="bg-[#0D1B2A] border-white/10 p-4 text-center">
          <CheckCircle2 className="w-6 h-6 text-green-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{taskStats.completed}/{taskStats.total}</p>
          <p className="text-xs text-[#F0F4F8]/50">Görev Tamamlama</p>
        </Card>
        <Card className="bg-[#0D1B2A] border-white/10 p-4 text-center">
          <Calendar className="w-6 h-6 text-[#00A3FF] mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{checkinRate}%</p>
          <p className="text-xs text-[#F0F4F8]/50">Check-in Oranı</p>
        </Card>
        <Card className="bg-[#0D1B2A] border-white/10 p-4 text-center">
          <TrendingUp className="w-6 h-6 text-purple-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{energyData.length > 0 ? energyData[energyData.length - 1].energy : "-"}</p>
          <p className="text-xs text-[#F0F4F8]/50">Son Enerji</p>
        </Card>
      </div>

      {/* Energy Trend Chart */}
      {energyData.length > 0 && (
        <Card className="bg-[#0D1B2A] border-white/10 p-6">
          <h3 className="font-display text-lg text-white mb-4">Enerji & Uyku Trendi</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={energyData}>
              <XAxis dataKey="date" stroke="#F0F4F8" opacity={0.3} fontSize={12} />
              <YAxis domain={[0, 10]} stroke="#F0F4F8" opacity={0.3} fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: "#0D1B2A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#F0F4F8" }} />
              <Area type="monotone" dataKey="energy" stroke="#00A3FF" fill="#00A3FF" fillOpacity={0.1} strokeWidth={2} name="Enerji" />
              <Area type="monotone" dataKey="sleep" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.1} strokeWidth={2} name="Uyku" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      )}
    </div>
  );
};

export default ProgressPage;
