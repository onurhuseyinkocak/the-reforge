import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Flame, CheckCircle2, Clock, MessageSquare, Target } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

const Dashboard = () => {
  const { user, profile } = useAuth();
  const [todayCheckin, setTodayCheckin] = useState<any>(null);
  const [pendingTasks, setPendingTasks] = useState<any[]>([]);
  const [latestMessage, setLatestMessage] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    const today = format(new Date(), "yyyy-MM-dd");

    supabase.from("checkins").select("*").eq("user_id", user.id).eq("checkin_date", today).then(({ data }) => {
      setTodayCheckin(data);
    });

    supabase.from("student_tasks").select("*, tasks(*)").eq("user_id", user.id).in("status", ["pending", "in_progress"]).limit(5).then(({ data }) => {
      setPendingTasks(data || []);
    });

    supabase.from("messages").select("*").eq("receiver_id", user.id).order("created_at", { ascending: false }).limit(1).then(({ data }) => {
      setLatestMessage(data?.[0]);
    });
  }, [user]);

  const totalWeeks = 24;
  const currentWeek = profile?.current_week || 1;
  const progressPercent = Math.round((currentWeek / totalWeeks) * 100);
  const hasMorning = todayCheckin?.some((c: any) => c.checkin_type === "morning");
  const hasEvening = todayCheckin?.some((c: any) => c.checkin_type === "evening");

  const phaseNames = ["The Foundation", "The Pressure", "The Tempering"];
  const currentPhase = profile?.current_phase || 1;

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h2 className="font-display text-2xl text-foreground tracking-wide">
          Hoş geldin, <span className="text-primary">{profile?.full_name || "Savaşçı"}</span>
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          {format(new Date(), "d MMMM yyyy, EEEE", { locale: tr })}
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border/30 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-ember/20 flex items-center justify-center">
              <Flame className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{profile?.streak || 0}</p>
              <p className="text-xs text-muted-foreground">Gün Serisi 🔥</p>
            </div>
          </div>
        </Card>

        <Card className="bg-card border-border/30 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">Faz {currentPhase}</p>
              <p className="text-xs text-muted-foreground">{phaseNames[currentPhase - 1]}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-card border-border/30 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">Hafta {currentWeek}</p>
              <p className="text-xs text-muted-foreground">/ {totalWeeks} hafta</p>
            </div>
          </div>
        </Card>

        <Card className="bg-card border-border/30 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-ember-glow/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-ember-glow" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{pendingTasks.length}</p>
              <p className="text-xs text-muted-foreground">Bekleyen Görev</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card className="bg-card border-border/30 p-5">
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm text-foreground/70">Genel İlerleme</p>
          <p className="text-sm text-primary font-medium">{progressPercent}%</p>
        </div>
        <Progress value={progressPercent} className="h-2 bg-secondary" />
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>Faz 1</span><span>Faz 2</span><span>Faz 3</span>
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Today's Check-in */}
        <Card className="bg-card border-border/30 p-5">
          <h3 className="font-display text-lg text-foreground mb-4">Bugünün Check-in Durumu</h3>
          <div className="space-y-3">
            <Link to="/check-in" className="flex items-center justify-between p-3 rounded-lg bg-secondary hover:bg-secondary/80 transition">
              <div className="flex items-center gap-3">
                <CheckCircle2 className={`w-5 h-5 ${hasMorning ? "text-green-400" : "text-muted-foreground"}`} />
                <span className="text-sm text-foreground">Sabah Check-in</span>
              </div>
              <span className={`text-xs px-2 py-1 rounded ${hasMorning ? "bg-green-500/20 text-green-400" : "bg-secondary text-muted-foreground"}`}>
                {hasMorning ? "Tamamlandı" : "Bekliyor"}
              </span>
            </Link>
            <Link to="/check-in" className="flex items-center justify-between p-3 rounded-lg bg-secondary hover:bg-secondary/80 transition">
              <div className="flex items-center gap-3">
                <CheckCircle2 className={`w-5 h-5 ${hasEvening ? "text-green-400" : "text-muted-foreground"}`} />
                <span className="text-sm text-foreground">Akşam Check-in</span>
              </div>
              <span className={`text-xs px-2 py-1 rounded ${hasEvening ? "bg-green-500/20 text-green-400" : "bg-secondary text-muted-foreground"}`}>
                {hasEvening ? "Tamamlandı" : "Bekliyor"}
              </span>
            </Link>
          </div>
        </Card>

        {/* Upcoming Tasks */}
        <Card className="bg-card border-border/30 p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-display text-lg text-foreground">Yaklaşan Görevler</h3>
            <Link to="/tasks" className="text-xs text-primary hover:underline">Tümünü Gör</Link>
          </div>
          {pendingTasks.length === 0 ? (
            <p className="text-sm text-muted-foreground">Bekleyen görev yok 🎉</p>
          ) : (
            <div className="space-y-2">
              {pendingTasks.slice(0, 4).map((st) => (
                <div key={st.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-sm text-foreground flex-1 truncate">{st.tasks?.title || "Görev"}</span>
                  <span className="text-xs text-muted-foreground">{st.status === "pending" ? "Bekliyor" : "Devam Ediyor"}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Mentor Message Preview */}
      {latestMessage && (
        <Card className="bg-card border-border/30 p-5">
          <div className="flex items-center gap-3 mb-3">
            <MessageSquare className="w-5 h-5 text-primary" />
            <h3 className="font-display text-lg text-foreground">Son Mentor Mesajı</h3>
          </div>
          <p className="text-sm text-foreground/70 line-clamp-2">{latestMessage.content}</p>
          <Link to="/messages" className="text-xs text-primary hover:underline mt-2 inline-block">Mesajlara Git →</Link>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
