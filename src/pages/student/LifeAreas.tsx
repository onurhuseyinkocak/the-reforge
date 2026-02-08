import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Dumbbell, Brain, Shirt, Home, Users, Briefcase, DollarSign, Camera, X, CheckCircle2, AlertCircle, Image } from "lucide-react";

const AREA_COLORS: Record<string, { bg: string; ring: string; text: string; slider: string; gradient: string }> = {
  physical: { bg: "bg-green-500/10", ring: "ring-green-500/40", text: "text-green-400", slider: "accent-green-500", gradient: "from-green-500 to-emerald-600" },
  mental: { bg: "bg-purple-500/10", ring: "ring-purple-500/40", text: "text-purple-400", slider: "accent-purple-500", gradient: "from-purple-500 to-violet-600" },
  style: { bg: "bg-pink-500/10", ring: "ring-pink-500/40", text: "text-pink-400", slider: "accent-pink-500", gradient: "from-pink-500 to-rose-600" },
  environment: { bg: "bg-sky-500/10", ring: "ring-sky-500/40", text: "text-sky-400", slider: "accent-sky-500", gradient: "from-sky-500 to-cyan-600" },
  social: { bg: "bg-orange-500/10", ring: "ring-orange-500/40", text: "text-orange-400", slider: "accent-orange-500", gradient: "from-orange-500 to-amber-600" },
  career: { bg: "bg-yellow-500/10", ring: "ring-yellow-500/40", text: "text-yellow-400", slider: "accent-yellow-500", gradient: "from-yellow-500 to-amber-500" },
  finance: { bg: "bg-emerald-500/10", ring: "ring-emerald-500/40", text: "text-emerald-400", slider: "accent-emerald-500", gradient: "from-emerald-500 to-teal-600" },
};

const AREAS = [
  { key: "physical", label: "Fiziksel", icon: Dumbbell, fields: [
    { name: "weight", label: "Kilo (kg)", type: "number" },
    { name: "workout_type", label: "Antrenman Türü", type: "text" },
    { name: "nutrition_score", label: "Beslenme (1-10)", type: "range" },
    { name: "water_liters", label: "Su (litre)", type: "number" },
    { name: "steps", label: "Adım Sayısı", type: "number" },
    { name: "sleep_hours", label: "Uyku Saati", type: "number" },
    { name: "body_fat", label: "Vücut Yağ Oranı (%)", type: "number" },
    { name: "notes", label: "Notlar", type: "textarea" },
  ]},
  { key: "mental", label: "Zihinsel", icon: Brain, fields: [
    { name: "mood", label: "Ruh Hali (1-10)", type: "range" },
    { name: "meditation_min", label: "Meditasyon (dk)", type: "number" },
    { name: "reading_min", label: "Okuma (dk)", type: "number" },
    { name: "stress_level", label: "Stres Seviyesi (1-10)", type: "range" },
    { name: "focus_min", label: "Odaklanma Süresi (dk)", type: "number" },
    { name: "new_learning", label: "Öğrenilen Yeni Şey", type: "text" },
    { name: "journal", label: "Günlük", type: "textarea" },
  ]},
  { key: "style", label: "Stil", icon: Shirt, fields: [
    { name: "grooming_done", label: "Bakım Yapıldı", type: "checkbox" },
    { name: "outfit_rating", label: "Kıyafet (1-10)", type: "range" },
    { name: "skincare_done", label: "Cilt Bakımı Yapıldı", type: "checkbox" },
    { name: "haircare_done", label: "Saç Bakımı Yapıldı", type: "checkbox" },
    { name: "accessory_score", label: "Aksesuar Puanı (1-10)", type: "range" },
    { name: "notes", label: "Notlar", type: "textarea" },
  ]},
  { key: "environment", label: "Çevre", icon: Home, fields: [
    { name: "room_clean", label: "Oda Temiz", type: "checkbox" },
    { name: "workspace_tidy", label: "İş Alanı Düzenli", type: "checkbox" },
    { name: "digital_detox_min", label: "Dijital Detox (dk)", type: "number" },
    { name: "nature_min", label: "Doğada Geçirilen Süre (dk)", type: "number" },
    { name: "plant_care", label: "Bitki Bakımı Yapıldı", type: "checkbox" },
    { name: "notes", label: "Notlar", type: "textarea" },
  ]},
  { key: "social", label: "Sosyal", icon: Users, fields: [
    { name: "social_interaction", label: "Sosyal Etkileşim (1-10)", type: "range" },
    { name: "new_connections", label: "Yeni Tanışma Sayısı", type: "number" },
    { name: "family_contact", label: "Aile ile İletişim", type: "checkbox" },
    { name: "mentor_meeting", label: "Mentor Görüşmesi", type: "checkbox" },
    { name: "boundaries_set", label: "Sınır Koyma", type: "checkbox" },
    { name: "notes", label: "Notlar", type: "textarea" },
  ]},
  { key: "career", label: "Kariyer", icon: Briefcase, fields: [
    { name: "productivity", label: "Verimlilik (1-10)", type: "range" },
    { name: "skill_learning_min", label: "Yeni Beceri Öğrenme (dk)", type: "number" },
    { name: "networking_done", label: "Networking Yapıldı", type: "checkbox" },
    { name: "goals_progress", label: "Hedef İlerlemesi", type: "text" },
    { name: "project_progress", label: "Proje İlerlemesi", type: "text" },
    { name: "notes", label: "Notlar", type: "textarea" },
  ]},
  { key: "finance", label: "Finans", icon: DollarSign, fields: [
    { name: "spending_control", label: "Harcama Kontrolü (1-10)", type: "range" },
    { name: "income_today", label: "Bugünkü Gelir (₺)", type: "number" },
    { name: "savings_today", label: "Bugün Biriktirilen (₺)", type: "number" },
    { name: "investment_done", label: "Yatırım Yapıldı", type: "checkbox" },
    { name: "unnecessary_spending", label: "Gereksiz Harcama (₺)", type: "number" },
    { name: "notes", label: "Notlar", type: "textarea" },
  ]},
];

const ProgressRing = ({ percent, color }: { percent: number; color: string }) => {
  const r = 18;
  const c = 2 * Math.PI * r;
  const offset = c - (percent / 100) * c;
  return (
    <svg width="44" height="44" className="transform -rotate-90">
      <circle cx="22" cy="22" r={r} fill="none" stroke="hsl(var(--secondary))" strokeWidth="3" />
      <circle cx="22" cy="22" r={r} fill="none" stroke="currentColor" strokeWidth="3"
        strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
        className={`transition-all duration-700 ${color}`} />
    </svg>
  );
};

const MiniSparkline = ({ data }: { data: number[] }) => {
  if (data.length < 2) return null;
  const max = Math.max(...data, 1);
  const w = 60, h = 20;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * h}`).join(" ");
  return (
    <svg width={w} height={h} className="opacity-60">
      <polyline points={points} fill="none" stroke="hsl(var(--primary))" strokeWidth="1.5" />
    </svg>
  );
};

const LifeAreas = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState("physical");
  const [metrics, setMetrics] = useState<Record<string, any>>({});
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [todayStatus, setTodayStatus] = useState<Record<string, boolean>>({});
  const [areaHistory, setAreaHistory] = useState<Record<string, number[]>>({});
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const today = format(new Date(), "yyyy-MM-dd");

  useEffect(() => {
    if (!user) return;
    supabase.from("life_area_entries").select("area, metrics").eq("user_id", user.id).eq("entry_date", today)
      .then(({ data }) => {
        const status: Record<string, boolean> = {};
        AREAS.forEach(a => { status[a.key] = (data || []).some(d => d.area === a.key); });
        setTodayStatus(status);
      });
    // Fetch last 7 days for sparklines
    supabase.from("life_area_entries").select("area, metrics, entry_date").eq("user_id", user.id)
      .gte("entry_date", format(new Date(Date.now() - 7 * 86400000), "yyyy-MM-dd"))
      .order("entry_date", { ascending: true })
      .then(({ data }) => {
        const hist: Record<string, number[]> = {};
        (data || []).forEach(d => {
          const m = d.metrics as Record<string, any> || {};
          const mainVal = Object.values(m).find(v => typeof v === "number") as number || 0;
          if (!hist[d.area]) hist[d.area] = [];
          hist[d.area].push(mainVal);
        });
        setAreaHistory(hist);
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
        } else { setMetrics({}); setPhotoUrls([]); }
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
  const colors = AREA_COLORS[tab];
  const updateMetric = (name: string, value: any) => setMetrics(m => ({ ...m, [name]: value }));
  const filledCount = Object.values(todayStatus).filter(Boolean).length;

  const getAreaFillPercent = (areaKey: string) => {
    if (!todayStatus[areaKey]) return 0;
    const a = AREAS.find(x => x.key === areaKey);
    if (!a) return 0;
    return 100;
  };

  return (
    <div className="space-y-6">
      {/* Daily Status Grid */}
      <Card className="bg-card border-border/30 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-xl text-foreground">Bugünün Durumu</h3>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${filledCount === 7 ? "from-green-400 to-emerald-500 animate-pulse" : "from-primary to-primary"}`} />
            <span className="text-sm font-bold text-primary">{filledCount}/{AREAS.length}</span>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-3">
          {AREAS.map(a => {
            const c = AREA_COLORS[a.key];
            const isActive = tab === a.key;
            const filled = todayStatus[a.key];
            return (
              <motion.button key={a.key} onClick={() => setTab(a.key)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className={`relative flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all ${isActive ? `${c.bg} ring-2 ${c.ring}` : "bg-secondary/50 hover:bg-secondary"}`}>
                <div className="relative">
                  <ProgressRing percent={getAreaFillPercent(a.key)} color={c.text} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    {filled ? <CheckCircle2 className={`w-4 h-4 ${c.text}`} /> : <a.icon className="w-4 h-4 text-muted-foreground" />}
                  </div>
                </div>
                <span className={`text-[10px] font-medium ${isActive ? c.text : "text-foreground/60"}`}>{a.label}</span>
                {areaHistory[a.key] && <MiniSparkline data={areaHistory[a.key]} />}
              </motion.button>
            );
          })}
        </div>
      </Card>

      {/* Area Form */}
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
          <Card className={`bg-card border-border/30 p-6 space-y-4 border-t-2 ${colors.ring.replace("ring-", "border-").replace("/40", "/60")}`}>
            <h3 className="font-display text-xl text-foreground flex items-center gap-2">
              <area.icon className={`w-5 h-5 ${colors.text}`} /> {area.label}
            </h3>

            {area.fields.map(f => (
              <div key={f.name}>
                {f.type === "range" ? (
                  <div>
                    <div className="flex justify-between mb-1">
                      <Label className="text-foreground/80">{f.label}</Label>
                      <span className={`font-bold text-sm ${colors.text}`}>{metrics[f.name] || 5}/10</span>
                    </div>
                    <input type="range" min={1} max={10} value={metrics[f.name] || 5} onChange={e => updateMetric(f.name, Number(e.target.value))}
                      className={`w-full h-2 bg-secondary rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:${colors.gradient} [&::-webkit-slider-thumb]:shadow-lg`} />
                  </div>
                ) : f.type === "textarea" ? (
                  <div>
                    <Label className="text-foreground/80">{f.label}</Label>
                    <Textarea value={metrics[f.name] || ""} onChange={e => updateMetric(f.name, e.target.value)}
                      className="bg-background border-border/30 text-foreground mt-1" rows={3} />
                  </div>
                ) : f.type === "checkbox" ? (
                  <div className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary/50 transition">
                    <Label className="text-foreground/80 cursor-pointer">{f.label}</Label>
                    <button onClick={() => updateMetric(f.name, !metrics[f.name])}
                      className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${metrics[f.name] ? `${colors.bg} ${colors.ring.replace("ring-", "border-")}` : "border-border/50"}`}>
                      {metrics[f.name] && <CheckCircle2 className={`w-4 h-4 ${colors.text}`} />}
                    </button>
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

            {/* Photo Upload */}
            <div className="border-t border-border/20 pt-4">
              <Label className="text-foreground/80 flex items-center gap-2 mb-3">
                <Camera className={`w-4 h-4 ${colors.text}`} /> Fotoğraf Kanıtı
              </Label>
              <div className="flex flex-wrap gap-2 mb-3">
                {photoUrls.map((url, i) => (
                  <div key={i} className="relative group w-20 h-20 rounded-lg overflow-hidden border border-border/30 cursor-pointer" onClick={() => setPreviewImage(url)}>
                    <img src={url} alt="" className="w-full h-full object-cover" loading="lazy" />
                    <button onClick={e => { e.stopPropagation(); removePhoto(url); }}
                      className="absolute top-0.5 right-0.5 bg-destructive/80 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition">
                      <X className="w-3 h-3 text-destructive-foreground" />
                    </button>
                  </div>
                ))}
                <label className={`w-20 h-20 rounded-lg border-2 border-dashed border-border/50 flex items-center justify-center cursor-pointer hover:${colors.ring.replace("ring-", "border-")} transition`}>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                  {uploading ? <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" /> : <Camera className="w-5 h-5 text-muted-foreground" />}
                </label>
              </div>
            </div>

            <Button onClick={handleSave} disabled={loading} className={`w-full bg-gradient-to-r ${colors.gradient} hover:opacity-90 text-white font-semibold`}>
              {loading ? "Kaydediliyor..." : "Kaydet ✨"}
            </Button>
          </Card>

          {/* History */}
          {history.length > 0 && (
            <Card className="bg-card border-border/30 p-4 mt-4">
              <h4 className="font-display text-lg text-foreground mb-3">Son 7 Giriş</h4>
              <div className="space-y-2">
                {history.map(h => (
                  <div key={h.id} className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/50 text-sm">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${colors.gradient}`} />
                      <span className="text-foreground">{format(new Date(h.entry_date), "d MMM")}</span>
                      {((h.photo_urls as string[]) || []).length > 0 && <Image className={`w-3 h-3 ${colors.text}`} />}
                    </div>
                    <span className="text-muted-foreground text-xs">{Object.keys(h.metrics || {}).length} metrik</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </motion.div>
      </AnimatePresence>

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
