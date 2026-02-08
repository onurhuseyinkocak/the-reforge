import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Sun, Moon, CheckCircle2, Flame, Trophy, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CheckIn = () => {
  const { user, profile } = useAuth();
  const [tab, setTab] = useState("morning");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [checkedDates, setCheckedDates] = useState<Date[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);

  const [wakeTime, setWakeTime] = useState("06:00");
  const [sleepRating, setSleepRating] = useState(7);
  const [energyRating, setEnergyRating] = useState(7);
  const [routineDone, setRoutineDone] = useState(false);
  const [priorities, setPriorities] = useState(["", "", ""]);
  const [intention, setIntention] = useState("");

  const [workoutDone, setWorkoutDone] = useState(false);
  const [nutritionRating, setNutritionRating] = useState(7);
  const [reflection, setReflection] = useState("");
  const [dayRating, setDayRating] = useState(7);
  const [priorityReview, setPriorityReview] = useState("");
  const [gratitude, setGratitude] = useState("");
  const [biggestWin, setBiggestWin] = useState("");
  const [tomorrowImprovement, setTomorrowImprovement] = useState("");

  useEffect(() => {
    if (!user) return;
    supabase.from("checkins").select("*").eq("user_id", user.id).order("checkin_date", { ascending: false }).limit(60).then(({ data }) => {
      setHistory(data || []);
      const dates = [...new Set((data || []).map(c => c.checkin_date))].map(d => new Date(d));
      setCheckedDates(dates);
    });
  }, [user]);

  const triggerConfetti = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  const handleMorningSubmit = async () => {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase.from("checkins").upsert({
      user_id: user.id, checkin_date: format(new Date(), "yyyy-MM-dd"), checkin_type: "morning",
      wake_time: wakeTime, sleep_rating: sleepRating, energy_rating: energyRating,
      routine_done: routineDone, priorities: priorities.filter(p => p.trim()),
      reflection: intention,
    }, { onConflict: "user_id,checkin_date,checkin_type" });
    setLoading(false);
    if (error) toast.error("Hata: " + error.message);
    else { toast.success("Sabah check-in kaydedildi! ☀️"); triggerConfetti(); }
  };

  const handleEveningSubmit = async () => {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase.from("checkins").upsert({
      user_id: user.id, checkin_date: format(new Date(), "yyyy-MM-dd"), checkin_type: "evening",
      workout_done: workoutDone, nutrition_rating: nutritionRating, reflection,
      day_rating: dayRating, priority_review: priorityReview, gratitude,
    }, { onConflict: "user_id,checkin_date,checkin_type" });
    setLoading(false);
    if (error) toast.error("Hata: " + error.message);
    else { toast.success("Akşam check-in kaydedildi! 🌙"); triggerConfetti(); }
  };

  const RatingSlider = ({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) => (
    <div>
      <div className="flex justify-between mb-1">
        <Label className="text-foreground/80">{label}</Label>
        <span className="text-primary font-bold">{value}/10</span>
      </div>
      <input type="range" min={1} max={10} value={value} onChange={e => onChange(Number(e.target.value))}
        className="w-full h-2 bg-secondary rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-lg" />
    </div>
  );

  const streak = profile?.streak || 0;

  return (
    <div className="space-y-6">
      {/* Confetti overlay */}
      <AnimatePresence>
        {showConfetti && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5 }}
              className="text-center">
              <Sparkles className="w-16 h-16 text-primary mx-auto mb-3" />
              <p className="text-2xl font-display text-foreground">Harika! 🔥</p>
              <p className="text-sm text-muted-foreground">Check-in tamamlandı!</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Streak Badge */}
      {streak > 0 && (
        <Card className="bg-gradient-to-r from-orange-500/10 via-card to-yellow-500/10 border-orange-500/20 p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-400" />
            <span className="text-sm text-foreground font-medium">{streak} Gün Serisi!</span>
          </div>
          {streak >= 7 && <Badge className="bg-yellow-500/20 text-yellow-400 border-0"><Trophy className="w-3 h-3 mr-1" /> Haftalık Seri</Badge>}
          {streak >= 30 && <Badge className="bg-orange-500/20 text-orange-400 border-0"><Trophy className="w-3 h-3 mr-1" /> Aylık Seri</Badge>}
        </Card>
      )}

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-card border border-border/30">
          <TabsTrigger value="morning" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            <Sun className="w-4 h-4 mr-2" /> Sabah
          </TabsTrigger>
          <TabsTrigger value="evening" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            <Moon className="w-4 h-4 mr-2" /> Akşam
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            Geçmiş
          </TabsTrigger>
        </TabsList>

        <TabsContent value="morning">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="bg-card border-border/30 p-6 space-y-5">
              <h3 className="font-display text-xl text-foreground">☀️ Sabah Check-in</h3>
              <div>
                <Label className="text-foreground/80">Uyanma Saati</Label>
                <Input type="time" value={wakeTime} onChange={e => setWakeTime(e.target.value)} className="bg-background border-border/30 text-foreground mt-1 w-40" />
              </div>
              <RatingSlider value={sleepRating} onChange={setSleepRating} label="Uyku Kalitesi" />
              <RatingSlider value={energyRating} onChange={setEnergyRating} label="Enerji Seviyesi" />
              <div className="flex items-center justify-between">
                <Label className="text-foreground/80">Sabah Rutini Tamamlandı mı?</Label>
                <Switch checked={routineDone} onCheckedChange={setRoutineDone} />
              </div>
              <div>
                <Label className="text-foreground/80 mb-2 block">Bugünün Niyeti 🎯</Label>
                <Input value={intention} onChange={e => setIntention(e.target.value)}
                  className="bg-background border-border/30 text-foreground" placeholder="Bugün neye odaklanacaksın?" />
              </div>
              <div>
                <Label className="text-foreground/80 mb-2 block">Bugünün 3 Önceliği</Label>
                {priorities.map((p, i) => (
                  <Input key={i} value={p} onChange={e => { const np = [...priorities]; np[i] = e.target.value; setPriorities(np); }}
                    className="bg-background border-border/30 text-foreground mb-2" placeholder={`Öncelik ${i + 1}`} />
                ))}
              </div>
              <Button onClick={handleMorningSubmit} disabled={loading} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                {loading ? "Kaydediliyor..." : "Sabah Check-in Kaydet ☀️"}
              </Button>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="evening">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="bg-card border-border/30 p-6 space-y-5">
              <h3 className="font-display text-xl text-foreground">🌙 Akşam Check-in</h3>
              <RatingSlider value={dayRating} onChange={setDayRating} label="Günün Genel Değerlendirmesi" />
              <div className="flex items-center justify-between">
                <Label className="text-foreground/80">Antrenman Yapıldı mı?</Label>
                <Switch checked={workoutDone} onCheckedChange={setWorkoutDone} />
              </div>
              <RatingSlider value={nutritionRating} onChange={setNutritionRating} label="Beslenme Kalitesi" />
              <div>
                <Label className="text-foreground/80">Bugünkü En Büyük Başarı 🏆</Label>
                <Input value={biggestWin} onChange={e => setBiggestWin(e.target.value)}
                  className="bg-background border-border/30 text-foreground mt-1" placeholder="Bugün en çok neyi başardın?" />
              </div>
              <div>
                <Label className="text-foreground/80">Önceliklerin Değerlendirmesi</Label>
                <Textarea value={priorityReview} onChange={e => setPriorityReview(e.target.value)}
                  className="bg-background border-border/30 text-foreground mt-1" rows={2} placeholder="Sabah belirlediğin önceliklerde nasıl performans gösterdin?" />
              </div>
              <div>
                <Label className="text-foreground/80">Günün Değerlendirmesi</Label>
                <Textarea value={reflection} onChange={e => setReflection(e.target.value)}
                  className="bg-background border-border/30 text-foreground mt-1" rows={3} placeholder="Bugün neler öğrendin?" />
              </div>
              <div>
                <Label className="text-foreground/80">Yarın İçin 1 İyileştirme 💡</Label>
                <Input value={tomorrowImprovement} onChange={e => setTomorrowImprovement(e.target.value)}
                  className="bg-background border-border/30 text-foreground mt-1" placeholder="Yarın neyi daha iyi yapabilirsin?" />
              </div>
              <div>
                <Label className="text-foreground/80">Minnet / Şükür</Label>
                <Textarea value={gratitude} onChange={e => setGratitude(e.target.value)}
                  className="bg-background border-border/30 text-foreground mt-1" rows={2} placeholder="Bugün neye minnettarsın?" />
              </div>
              <Button onClick={handleEveningSubmit} disabled={loading} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                {loading ? "Kaydediliyor..." : "Akşam Check-in Kaydet 🌙"}
              </Button>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="history">
          <Card className="bg-card border-border/30 p-6">
            <h3 className="font-display text-xl text-foreground mb-4">Check-in Geçmişi</h3>
            <div className="flex justify-center">
              <Calendar mode="multiple" selected={checkedDates} className="text-foreground"
                modifiersStyles={{ selected: { backgroundColor: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" } }} />
            </div>
            <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
              {history.slice(0, 14).map(c => (
                <div key={c.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-secondary text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <span className="text-foreground">{format(new Date(c.checkin_date), "d MMM", { locale: tr })}</span>
                  <span className="text-primary">{c.checkin_type === "morning" ? "☀️ Sabah" : "🌙 Akşam"}</span>
                  {c.energy_rating && <span className="text-muted-foreground ml-auto">Enerji: {c.energy_rating}/10</span>}
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CheckIn;
