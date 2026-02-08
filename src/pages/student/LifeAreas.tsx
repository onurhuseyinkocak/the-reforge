import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { format } from "date-fns";
import { Dumbbell, Brain, Shirt, Home, Users, Briefcase, DollarSign } from "lucide-react";

const AREAS = [
  { key: "physical", label: "Fiziksel", icon: Dumbbell, fields: [
    { name: "weight", label: "Kilo (kg)", type: "number" },
    { name: "workout_type", label: "Antrenman Türü", type: "text" },
    { name: "nutrition_score", label: "Beslenme (1-10)", type: "range" },
    { name: "water_liters", label: "Su (litre)", type: "number" },
    { name: "notes", label: "Notlar", type: "textarea" },
  ]},
  { key: "mental", label: "Zihinsel", icon: Brain, fields: [
    { name: "mood", label: "Ruh Hali (1-10)", type: "range" },
    { name: "meditation_min", label: "Meditasyon (dk)", type: "number" },
    { name: "reading_min", label: "Okuma (dk)", type: "number" },
    { name: "journal", label: "Günlük", type: "textarea" },
  ]},
  { key: "style", label: "Stil", icon: Shirt, fields: [
    { name: "grooming_done", label: "Bakım Yapıldı", type: "checkbox" },
    { name: "outfit_rating", label: "Kıyafet (1-10)", type: "range" },
    { name: "notes", label: "Notlar", type: "textarea" },
  ]},
  { key: "environment", label: "Çevre", icon: Home, fields: [
    { name: "room_clean", label: "Oda Temiz", type: "checkbox" },
    { name: "digital_detox_min", label: "Dijital Detox (dk)", type: "number" },
    { name: "notes", label: "Notlar", type: "textarea" },
  ]},
  { key: "social", label: "Sosyal", icon: Users, fields: [
    { name: "social_interaction", label: "Sosyal Etkileşim (1-10)", type: "range" },
    { name: "boundaries_set", label: "Sınır Koyma", type: "checkbox" },
    { name: "notes", label: "Notlar", type: "textarea" },
  ]},
  { key: "career", label: "Kariyer", icon: Briefcase, fields: [
    { name: "productivity", label: "Verimlilik (1-10)", type: "range" },
    { name: "goals_progress", label: "Hedef İlerlemesi", type: "text" },
    { name: "notes", label: "Notlar", type: "textarea" },
  ]},
  { key: "finance", label: "Finans", icon: DollarSign, fields: [
    { name: "spending_control", label: "Harcama Kontrolü (1-10)", type: "range" },
    { name: "savings_today", label: "Bugün Biriktirilen (₺)", type: "number" },
    { name: "notes", label: "Notlar", type: "textarea" },
  ]},
];

const LifeAreas = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState("physical");
  const [metrics, setMetrics] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  const today = format(new Date(), "yyyy-MM-dd");

  useEffect(() => {
    if (!user) return;
    supabase.from("life_area_entries").select("*").eq("user_id", user.id).eq("area", tab).order("entry_date", { ascending: false }).limit(7)
      .then(({ data }) => {
        setHistory(data || []);
        const todayEntry = data?.find(d => d.entry_date === today);
        if (todayEntry) setMetrics(todayEntry.metrics as Record<string, any> || {});
        else setMetrics({});
      });
  }, [user, tab]);

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase.from("life_area_entries").upsert({
      user_id: user.id, area: tab, entry_date: today, metrics,
    }, { onConflict: "user_id,area,entry_date" });
    setLoading(false);
    if (error) toast.error("Hata: " + error.message);
    else toast.success("Kaydedildi ✅");
  };

  const area = AREAS.find(a => a.key === tab)!;

  const updateMetric = (name: string, value: any) => setMetrics(m => ({ ...m, [name]: value }));

  return (
    <div className="space-y-6">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-card border border-border/30 flex-wrap h-auto gap-1 p-1">
          {AREAS.map(a => (
            <TabsTrigger key={a.key} value={a.key} className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary text-xs px-2 py-1.5">
              <a.icon className="w-3 h-3 mr-1" /> {a.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {AREAS.map(a => (
          <TabsContent key={a.key} value={a.key}>
            <Card className="bg-card border-border/30 p-6 space-y-4">
              <h3 className="font-display text-xl text-foreground flex items-center gap-2">
                <a.icon className="w-5 h-5 text-primary" /> {a.label}
              </h3>
              {a.fields.map(f => (
                <div key={f.name}>
                  {f.type === "range" ? (
                    <div>
                      <div className="flex justify-between mb-1">
                        <Label className="text-foreground/80">{f.label}</Label>
                        <span className="text-primary font-bold text-sm">{metrics[f.name] || 5}/10</span>
                      </div>
                      <input type="range" min={1} max={10} value={metrics[f.name] || 5} onChange={e => updateMetric(f.name, Number(e.target.value))}
                        className="w-full h-2 bg-secondary rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary" />
                    </div>
                  ) : f.type === "textarea" ? (
                    <div>
                      <Label className="text-foreground/80">{f.label}</Label>
                      <Textarea value={metrics[f.name] || ""} onChange={e => updateMetric(f.name, e.target.value)}
                        className="bg-background border-border/30 text-foreground mt-1" rows={3} />
                    </div>
                  ) : f.type === "checkbox" ? (
                    <div className="flex items-center justify-between">
                      <Label className="text-foreground/80">{f.label}</Label>
                      <input type="checkbox" checked={metrics[f.name] || false} onChange={e => updateMetric(f.name, e.target.checked)}
                        className="w-4 h-4 accent-[hsl(var(--primary))]" />
                    </div>
                  ) : (
                    <div>
                      <Label className="text-foreground/80">{f.label}</Label>
                      <Input type={f.type} value={metrics[f.name] || ""} onChange={e => updateMetric(f.name, f.type === "number" ? Number(e.target.value) : e.target.value)}
                        className="bg-background border-border/30 text-foreground mt-1" />
                    </div>
                  )}
                </div>
              ))}
              <Button onClick={handleSave} disabled={loading} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                {loading ? "Kaydediliyor..." : "Kaydet"}
              </Button>
            </Card>

            {history.length > 0 && (
              <Card className="bg-card border-border/30 p-4 mt-4">
                <h4 className="font-display text-lg text-foreground mb-3">Son 7 Giriş</h4>
                <div className="space-y-2">
                  {history.map(h => (
                    <div key={h.id} className="flex items-center justify-between p-2 rounded bg-secondary text-sm">
                      <span className="text-foreground">{format(new Date(h.entry_date), "d MMM")}</span>
                      <span className="text-muted-foreground text-xs">{Object.keys(h.metrics || {}).length} metrik</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default LifeAreas;
