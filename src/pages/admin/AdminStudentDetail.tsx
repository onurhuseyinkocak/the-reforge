import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, User, Flame, Calendar, MessageSquare } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { toast } from "sonner";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

const AdminStudentDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [checkins, setCheckins] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [newNote, setNewNote] = useState("");

  useEffect(() => {
    if (!id) return;
    supabase.from("profiles").select("*").eq("user_id", id).maybeSingle().then(({ data }) => setProfile(data));
    supabase.from("checkins").select("*").eq("user_id", id).order("checkin_date", { ascending: true }).limit(30).then(({ data }) => setCheckins(data || []));
    supabase.from("admin_notes").select("*").eq("student_id", id).order("created_at", { ascending: false }).then(({ data }) => setNotes(data || []));
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

  const energyData = checkins.filter(c => c.energy_rating).map(c => ({ date: c.checkin_date.slice(5), energy: c.energy_rating }));
  const progressPercent = profile ? Math.round((profile.current_week / 24) * 100) : 0;

  if (!profile) return <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <Link to="/admin/students" className="inline-flex items-center gap-2 text-primary hover:underline text-sm">
        <ArrowLeft className="w-4 h-4" /> Öğrencilere Dön
      </Link>

      <Card className="bg-card border-border/30 p-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
            <User className="w-7 h-7 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="font-display text-2xl text-foreground">{profile.full_name}</h2>
            <div className="flex items-center gap-3 mt-1">
              <Badge className={profile.status === "active" ? "bg-green-500/20 text-green-400" : profile.status === "at-risk" ? "bg-ember/20 text-ember" : "bg-red-500/20 text-red-400"}>
                {profile.status}
              </Badge>
              <span className="text-sm text-muted-foreground">Faz {profile.current_phase} · Hafta {profile.current_week}</span>
              <span className="text-sm text-primary flex items-center gap-1"><Flame className="w-4 h-4" />{profile.streak}</span>
            </div>
          </div>
        </div>
        <Progress value={progressPercent} className="h-2 bg-secondary mt-4" />
      </Card>

      {energyData.length > 0 && (
        <Card className="bg-card border-border/30 p-6">
          <h3 className="font-display text-lg text-foreground mb-4">Enerji Trendi</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={energyData}>
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis domain={[0, 10]} stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} />
              <Line type="monotone" dataKey="energy" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      <Card className="bg-card border-border/30 p-6">
        <h3 className="font-display text-lg text-foreground mb-4">Notlar</h3>
        <div className="flex gap-2 mb-4">
          <Textarea value={newNote} onChange={e => setNewNote(e.target.value)} className="bg-background border-border/30 text-foreground" rows={2} placeholder="Not ekle..." />
          <Button onClick={addNote} className="bg-primary hover:bg-primary/90 self-end">Ekle</Button>
        </div>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {notes.map(n => (
            <div key={n.id} className="p-3 rounded-lg bg-secondary">
              <p className="text-sm text-foreground">{n.content}</p>
              <p className="text-xs text-muted-foreground mt-1">{format(new Date(n.created_at), "d MMM yyyy HH:mm", { locale: tr })}</p>
            </div>
          ))}
        </div>
      </Card>

      <Link to="/admin/messages">
        <Button variant="outline" className="border-border/30 text-foreground hover:bg-secondary">
          <MessageSquare className="w-4 h-4 mr-2" /> Mesaj Gönder
        </Button>
      </Link>
    </div>
  );
};

export default AdminStudentDetail;
