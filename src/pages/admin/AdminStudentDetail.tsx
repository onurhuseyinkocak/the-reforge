import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, User, Flame, MessageSquare, Brain, Loader2, Image, X } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { toast } from "sonner";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

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

  const energyData = checkins.filter(c => c.energy_rating).map(c => ({ date: c.checkin_date.slice(5), energy: c.energy_rating }));
  const progressPercent = profile ? Math.round((profile.current_week / 24) * 100) : 0;

  const riskColor = (level: string) => {
    if (level === "high") return "bg-destructive/20 text-destructive";
    if (level === "medium") return "bg-yellow-500/20 text-yellow-400";
    return "bg-green-500/20 text-green-400";
  };

  const allPhotos = lifePhotos.flatMap(lp => ((lp.photo_urls as string[]) || []).map(url => ({ url, area: lp.area, date: lp.entry_date })));

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
              <Badge className={profile.status === "active" ? "bg-green-500/20 text-green-400" : profile.status === "at-risk" ? "bg-destructive/20 text-destructive" : "bg-red-500/20 text-red-400"}>
                {profile.status}
              </Badge>
              <span className="text-sm text-muted-foreground">Faz {profile.current_phase} · Hafta {profile.current_week}</span>
              <span className="text-sm text-primary flex items-center gap-1"><Flame className="w-4 h-4" />{profile.streak}</span>
            </div>
          </div>
          <Button onClick={analyzeStudent} disabled={analyzing} size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
            {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Brain className="w-4 h-4 mr-1" /> Analiz Et</>}
          </Button>
        </div>
        <Progress value={progressPercent} className="h-2 bg-secondary mt-4" />
      </Card>

      {/* AI Reports */}
      {aiReports.length > 0 && (
        <Card className="bg-card border-border/30 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="w-5 h-5 text-primary" />
            <h3 className="font-display text-lg text-foreground">AI Analiz Raporları</h3>
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {aiReports.map(r => (
              <div key={r.id} className="p-4 rounded-lg bg-secondary">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">{format(new Date(r.created_at), "d MMM yyyy HH:mm", { locale: tr })}</span>
                  <Badge className={`${riskColor(r.risk_level)} text-xs`}>
                    {r.risk_level === "high" ? "Yüksek Risk" : r.risk_level === "medium" ? "Orta Risk" : "Düşük Risk"}
                  </Badge>
                </div>
                <p className="text-sm text-foreground mb-2">{r.summary}</p>
                {r.recommendations && (r.recommendations as any[]).length > 0 && (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-muted-foreground font-medium">Öneriler:</p>
                    {(r.recommendations as any[]).map((rec: any, i: number) => (
                      <div key={i} className="flex items-start gap-2 text-xs">
                        <span className="text-primary">•</span>
                        <span className="text-foreground/80"><strong>{rec.area}:</strong> {rec.suggestion}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

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

      {/* Life Area Photos */}
      {allPhotos.length > 0 && (
        <Card className="bg-card border-border/30 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Image className="w-5 h-5 text-primary" />
            <h3 className="font-display text-lg text-foreground">Yaşam Alanı Fotoğrafları</h3>
          </div>
          <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
            {allPhotos.slice(0, 18).map((p, i) => (
              <div key={i} className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group" onClick={() => setPreviewImage(p.url)}>
                <img src={p.url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition" />
                <div className="absolute bottom-0 left-0 right-0 bg-background/70 px-1 py-0.5">
                  <p className="text-[9px] text-foreground truncate">{p.area} · {p.date}</p>
                </div>
              </div>
            ))}
          </div>
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

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 bg-background/90 flex items-center justify-center p-4" onClick={() => setPreviewImage(null)}>
          <img src={previewImage} alt="" className="max-w-full max-h-[80vh] rounded-xl shadow-lg" />
          <button onClick={() => setPreviewImage(null)} className="absolute top-4 right-4 p-2 bg-card rounded-full">
            <X className="w-6 h-6 text-foreground" />
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminStudentDetail;
