import { useState, useEffect, useRef } from "react";
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
import { Dumbbell, Brain, Shirt, Home, Users, Briefcase, DollarSign, Camera, X, CheckCircle2, AlertCircle, Image } from "lucide-react";

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
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [todayStatus, setTodayStatus] = useState<Record<string, boolean>>({});
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const today = format(new Date(), "yyyy-MM-dd");

  // Fetch today's status for all areas
  useEffect(() => {
    if (!user) return;
    supabase.from("life_area_entries").select("area").eq("user_id", user.id).eq("entry_date", today)
      .then(({ data }) => {
        const status: Record<string, boolean> = {};
        AREAS.forEach(a => { status[a.key] = (data || []).some(d => d.area === a.key); });
        setTodayStatus(status);
      });
  }, [user, today]);

  useEffect(() => {
    if (!user) return;
    supabase.from("life_area_entries").select("*").eq("user_id", user.id).eq("area", tab).order("entry_date", { ascending: false }).limit(7)
      .then(({ data }) => {
        setHistory(data || []);
        const todayEntry = data?.find(d => d.entry_date === today);
        if (todayEntry) {
          setMetrics(todayEntry.metrics as Record<string, any> || {});
          setPhotoUrls((todayEntry.photo_urls as string[]) || []);
        } else {
          setMetrics({});
          setPhotoUrls([]);
        }
      });
  }, [user, tab]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/${tab}/${today}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("life-area-photos").upload(path, file);
    if (error) { toast.error("Yükleme hatası"); setUploading(false); return; }
    const { data: { publicUrl } } = supabase.storage.from("life-area-photos").getPublicUrl(path);
    setPhotoUrls(prev => [...prev, publicUrl]);
    setUploading(false);
    toast.success("Fotoğraf yüklendi 📸");
    if (fileRef.current) fileRef.current.value = "";
  };

  const removePhoto = (url: string) => setPhotoUrls(prev => prev.filter(p => p !== url));

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase.from("life_area_entries").upsert({
      user_id: user.id, area: tab, entry_date: today, metrics, photo_urls: photoUrls,
    }, { onConflict: "user_id,area,entry_date" });
    setLoading(false);
    if (error) toast.error("Hata: " + error.message);
    else {
      toast.success("Kaydedildi ✅");
      setTodayStatus(prev => ({ ...prev, [tab]: true }));
    }
  };

  const area = AREAS.find(a => a.key === tab)!;
  const updateMetric = (name: string, value: any) => setMetrics(m => ({ ...m, [name]: value }));

  const filledCount = Object.values(todayStatus).filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Daily Status Summary */}
      <Card className="bg-card border-border/30 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-lg text-foreground">Bugünün Durumu</h3>
          <span className="text-sm text-primary font-semibold">{filledCount}/{AREAS.length}</span>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {AREAS.map(a => (
            <button key={a.key} onClick={() => setTab(a.key)}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${tab === a.key ? "bg-primary/20 ring-1 ring-primary" : "bg-secondary hover:bg-secondary/80"}`}>
              {todayStatus[a.key] ? (
                <CheckCircle2 className="w-5 h-5 text-green-400" />
              ) : (
                <AlertCircle className="w-5 h-5 text-muted-foreground" />
              )}
              <span className="text-[10px] text-foreground/70">{a.label}</span>
            </button>
          ))}
        </div>
      </Card>

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

              {/* Photo Upload Section */}
              <div className="border-t border-border/20 pt-4">
                <Label className="text-foreground/80 flex items-center gap-2 mb-3">
                  <Camera className="w-4 h-4 text-primary" /> Fotoğraf Kanıtı
                </Label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {photoUrls.map((url, i) => (
                    <div key={i} className="relative group w-20 h-20 rounded-lg overflow-hidden border border-border/30 cursor-pointer" onClick={() => setPreviewImage(url)}>
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <button onClick={e => { e.stopPropagation(); removePhoto(url); }}
                        className="absolute top-0.5 right-0.5 bg-destructive/80 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition">
                        <X className="w-3 h-3 text-destructive-foreground" />
                      </button>
                    </div>
                  ))}
                  <label className="w-20 h-20 rounded-lg border-2 border-dashed border-border/50 flex items-center justify-center cursor-pointer hover:border-primary/50 transition">
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                    {uploading ? (
                      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Camera className="w-5 h-5 text-muted-foreground" />
                    )}
                  </label>
                </div>
              </div>

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
                      <div className="flex items-center gap-2">
                        <span className="text-foreground">{format(new Date(h.entry_date), "d MMM")}</span>
                        {((h.photo_urls as string[]) || []).length > 0 && (
                          <Image className="w-3 h-3 text-primary" />
                        )}
                      </div>
                      <span className="text-muted-foreground text-xs">{Object.keys(h.metrics || {}).length} metrik</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>

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

export default LifeAreas;
