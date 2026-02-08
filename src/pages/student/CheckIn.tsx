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
import { toast } from "sonner";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Sun, Moon, CheckCircle2 } from "lucide-react";

const CheckIn = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState("morning");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [checkedDates, setCheckedDates] = useState<Date[]>([]);

  // Morning form
  const [wakeTime, setWakeTime] = useState("06:00");
  const [sleepRating, setSleepRating] = useState(7);
  const [energyRating, setEnergyRating] = useState(7);
  const [routineDone, setRoutineDone] = useState(false);
  const [priorities, setPriorities] = useState(["", "", ""]);

  // Evening form
  const [workoutDone, setWorkoutDone] = useState(false);
  const [nutritionRating, setNutritionRating] = useState(7);
  const [reflection, setReflection] = useState("");

  useEffect(() => {
    if (!user) return;
    supabase.from("checkins").select("*").eq("user_id", user.id).order("checkin_date", { ascending: false }).limit(60).then(({ data }) => {
      setHistory(data || []);
      const dates = [...new Set((data || []).map(c => c.checkin_date))].map(d => new Date(d));
      setCheckedDates(dates);
    });
  }, [user]);

  const handleMorningSubmit = async () => {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase.from("checkins").upsert({
      user_id: user.id,
      checkin_date: format(new Date(), "yyyy-MM-dd"),
      checkin_type: "morning",
      wake_time: wakeTime,
      sleep_rating: sleepRating,
      energy_rating: energyRating,
      routine_done: routineDone,
      priorities: priorities.filter(p => p.trim()),
    }, { onConflict: "user_id,checkin_date,checkin_type" });
    setLoading(false);
    if (error) toast.error("Hata: " + error.message);
    else toast.success("Sabah check-in kaydedildi! ☀️");
  };

  const handleEveningSubmit = async () => {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase.from("checkins").upsert({
      user_id: user.id,
      checkin_date: format(new Date(), "yyyy-MM-dd"),
      checkin_type: "evening",
      workout_done: workoutDone,
      nutrition_rating: nutritionRating,
      reflection,
    }, { onConflict: "user_id,checkin_date,checkin_type" });
    setLoading(false);
    if (error) toast.error("Hata: " + error.message);
    else toast.success("Akşam check-in kaydedildi! 🌙");
  };

  const RatingSlider = ({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) => (
    <div>
      <div className="flex justify-between mb-1">
        <Label className="text-[#F0F4F8]/80">{label}</Label>
        <span className="text-[#00A3FF] font-bold">{value}/10</span>
      </div>
      <input type="range" min={1} max={10} value={value} onChange={e => onChange(Number(e.target.value))}
        className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#00A3FF]" />
    </div>
  );

  return (
    <div className="space-y-6">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-[#0D1B2A] border border-white/10">
          <TabsTrigger value="morning" className="data-[state=active]:bg-[#00A3FF]/20 data-[state=active]:text-[#00A3FF]">
            <Sun className="w-4 h-4 mr-2" /> Sabah
          </TabsTrigger>
          <TabsTrigger value="evening" className="data-[state=active]:bg-[#00A3FF]/20 data-[state=active]:text-[#00A3FF]">
            <Moon className="w-4 h-4 mr-2" /> Akşam
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-[#00A3FF]/20 data-[state=active]:text-[#00A3FF]">
            Geçmiş
          </TabsTrigger>
        </TabsList>

        <TabsContent value="morning">
          <Card className="bg-[#0D1B2A] border-white/10 p-6 space-y-5">
            <h3 className="font-display text-xl text-white">☀️ Sabah Check-in</h3>
            <div>
              <Label className="text-[#F0F4F8]/80">Uyanma Saati</Label>
              <Input type="time" value={wakeTime} onChange={e => setWakeTime(e.target.value)} className="bg-[#0A1628] border-white/10 text-white mt-1 w-40" />
            </div>
            <RatingSlider value={sleepRating} onChange={setSleepRating} label="Uyku Kalitesi" />
            <RatingSlider value={energyRating} onChange={setEnergyRating} label="Enerji Seviyesi" />
            <div className="flex items-center justify-between">
              <Label className="text-[#F0F4F8]/80">Sabah Rutini Tamamlandı mı?</Label>
              <Switch checked={routineDone} onCheckedChange={setRoutineDone} />
            </div>
            <div>
              <Label className="text-[#F0F4F8]/80 mb-2 block">Bugünün 3 Önceliği</Label>
              {priorities.map((p, i) => (
                <Input key={i} value={p} onChange={e => { const np = [...priorities]; np[i] = e.target.value; setPriorities(np); }}
                  className="bg-[#0A1628] border-white/10 text-white mb-2" placeholder={`Öncelik ${i + 1}`} />
              ))}
            </div>
            <Button onClick={handleMorningSubmit} disabled={loading} className="w-full bg-[#00A3FF] hover:bg-[#00A3FF]/90 text-white">
              {loading ? "Kaydediliyor..." : "Sabah Check-in Kaydet"}
            </Button>
          </Card>
        </TabsContent>

        <TabsContent value="evening">
          <Card className="bg-[#0D1B2A] border-white/10 p-6 space-y-5">
            <h3 className="font-display text-xl text-white">🌙 Akşam Check-in</h3>
            <div className="flex items-center justify-between">
              <Label className="text-[#F0F4F8]/80">Antrenman Yapıldı mı?</Label>
              <Switch checked={workoutDone} onCheckedChange={setWorkoutDone} />
            </div>
            <RatingSlider value={nutritionRating} onChange={setNutritionRating} label="Beslenme Kalitesi" />
            <div>
              <Label className="text-[#F0F4F8]/80">Günün Değerlendirmesi</Label>
              <Textarea value={reflection} onChange={e => setReflection(e.target.value)}
                className="bg-[#0A1628] border-white/10 text-white mt-1" rows={4} placeholder="Bugün neler öğrendin? Neler geliştirebilirsin?" />
            </div>
            <Button onClick={handleEveningSubmit} disabled={loading} className="w-full bg-[#00A3FF] hover:bg-[#00A3FF]/90 text-white">
              {loading ? "Kaydediliyor..." : "Akşam Check-in Kaydet"}
            </Button>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card className="bg-[#0D1B2A] border-white/10 p-6">
            <h3 className="font-display text-xl text-white mb-4">Check-in Geçmişi</h3>
            <div className="flex justify-center">
              <Calendar
                mode="multiple"
                selected={checkedDates}
                className="text-white"
                modifiersStyles={{ selected: { backgroundColor: "#00A3FF", color: "white" } }}
              />
            </div>
            <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
              {history.slice(0, 14).map(c => (
                <div key={c.id} className="flex items-center gap-3 p-2 rounded bg-white/5 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <span className="text-white">{format(new Date(c.checkin_date), "d MMM", { locale: tr })}</span>
                  <span className="text-[#00A3FF]">{c.checkin_type === "morning" ? "Sabah" : "Akşam"}</span>
                  {c.energy_rating && <span className="text-[#F0F4F8]/40">Enerji: {c.energy_rating}/10</span>}
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
