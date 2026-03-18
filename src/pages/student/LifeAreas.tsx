import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Dumbbell, Brain, Shirt, Home, Users, Briefcase, DollarSign, Camera, X, CheckCircle2, Image, TrendingUp, Zap, ListChecks } from "lucide-react";

const AREA_COLORS: Record<string, { bg: string; ring: string; text: string; slider: string; gradient: string; hex: string }> = {
  physical: { bg: "bg-green-500/10", ring: "ring-green-500/40", text: "text-green-400", slider: "accent-green-500", gradient: "from-green-500 to-emerald-600", hex: "#22c55e" },
  mental: { bg: "bg-purple-500/10", ring: "ring-purple-500/40", text: "text-purple-400", slider: "accent-purple-500", gradient: "from-purple-500 to-violet-600", hex: "#a855f7" },
  style: { bg: "bg-pink-500/10", ring: "ring-pink-500/40", text: "text-pink-400", slider: "accent-pink-500", gradient: "from-pink-500 to-rose-600", hex: "#ec4899" },
  environment: { bg: "bg-sky-500/10", ring: "ring-sky-500/40", text: "text-sky-400", slider: "accent-sky-500", gradient: "from-sky-500 to-cyan-600", hex: "#0ea5e9" },
  social: { bg: "bg-orange-500/10", ring: "ring-orange-500/40", text: "text-orange-400", slider: "accent-orange-500", gradient: "from-orange-500 to-amber-600", hex: "#f97316" },
  career: { bg: "bg-yellow-500/10", ring: "ring-yellow-500/40", text: "text-yellow-400", slider: "accent-yellow-500", gradient: "from-yellow-500 to-amber-500", hex: "#eab308" },
  finance: { bg: "bg-emerald-500/10", ring: "ring-emerald-500/40", text: "text-emerald-400", slider: "accent-emerald-500", gradient: "from-emerald-500 to-teal-600", hex: "#10b981" },
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

const MiniSparkline = ({ data, color }: { data: number[]; color: string }) => {
  if (data.length < 2) return null;
  const max = Math.max(...data, 1);
  const w = 56, h = 20;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * h}`).join(" ");
  return (
    <svg width={w} height={h} className="opacity-70">
      <defs>
        <linearGradient id={`spark-${color.replace('#','')}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="1" />
        </linearGradient>
      </defs>
      <polyline points={points} fill="none" stroke={`url(#spark-${color.replace('#','')})`} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] } },
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
  const [quickMode, setQuickMode] = useState(true);
  const [quickRatings, setQuickRatings] = useState<Record<string, number>>({});
  const [quickNotes, setQuickNotes] = useState<Record<string, string>>({});
  const [quickLoading, setQuickLoading] = useState(false);
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
    toast.success("Fotoğraf yüklendi!");
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
      toast.success("Kaydedildi!");
      setTodayStatus(prev => ({ ...prev, [tab]: true }));
    }
  };

  const handleQuickSaveAll = async () => {
    if (!user) return;
    setQuickLoading(true);
    const promises = AREAS.map((a) => {
      const rating = quickRatings[a.key] || 5;
      const note = quickNotes[a.key] || "";
      return supabase.from("life_area_entries").upsert(
        {
          user_id: user.id,
          area: a.key,
          entry_date: today,
          metrics: { quick_rating: rating, notes: note },
          photo_urls: [],
        },
        { onConflict: "user_id,area,entry_date" }
      );
    });
    const results = await Promise.all(promises);
    setQuickLoading(false);
    const hasError = results.some((r) => r.error);
    if (hasError) toast.error("Bazı alanlar kaydedilemedi");
    else {
      toast.success("Tüm alanlar kaydedildi!");
      const newStatus: Record<string, boolean> = {};
      AREAS.forEach((a) => { newStatus[a.key] = true; });
      setTodayStatus(newStatus);
    }
  };

  const area = AREAS.find(a => a.key === tab)!;
  const colors = AREA_COLORS[tab];
  const updateMetric = (name: string, value: any) => setMetrics(m => ({ ...m, [name]: value }));
  const filledCount = Object.values(todayStatus).filter(Boolean).length;

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6 relative"
    >
      {/* Background glow */}
      <div className="fixed top-32 right-1/4 w-[500px] h-[500px] rounded-full blur-[140px] pointer-events-none transition-colors duration-700" style={{ background: `${colors.hex}06` }} />

      {/* Daily Status Grid */}
      <motion.div variants={item}>
        <div className="relative overflow-hidden rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-xl">
          <div className="h-[2px] bg-gradient-to-r from-transparent via-[#FF4500]/40 to-transparent" />
          <div className="p-5">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-xl text-white tracking-wide">Bugunun Durumu</h3>
              <div className="flex items-center gap-2.5">
                <div className="flex gap-0.5">
                  {AREAS.map(a => (
                    <div
                      key={a.key}
                      className="w-1.5 h-4 rounded-full transition-all duration-500"
                      style={{ background: todayStatus[a.key] ? AREA_COLORS[a.key].hex : 'rgba(255,255,255,0.06)' }}
                    />
                  ))}
                </div>
                <span className="text-sm font-bold" style={{ color: filledCount === 7 ? '#22c55e' : '#FF4500' }}>
                  {filledCount}/{AREAS.length}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2.5">
              {AREAS.map(a => {
                const c = AREA_COLORS[a.key];
                const isActive = tab === a.key;
                const filled = todayStatus[a.key];
                return (
                  <motion.button
                    key={a.key}
                    onClick={() => setTab(a.key)}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-300"
                    style={{
                      background: isActive ? `${c.hex}15` : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${isActive ? `${c.hex}40` : 'rgba(255,255,255,0.04)'}`,
                      boxShadow: isActive ? `0 0 20px ${c.hex}10` : 'none',
                    }}
                  >
                    {/* Top micro-accent */}
                    {isActive && (
                      <div className="absolute top-0 left-2 right-2 h-[2px] rounded-full" style={{ background: `linear-gradient(to right, transparent, ${c.hex}, transparent)` }} />
                    )}

                    <div className="relative w-9 h-9 rounded-lg flex items-center justify-center transition-all" style={{ background: isActive || filled ? `${c.hex}20` : 'rgba(255,255,255,0.04)' }}>
                      {filled ? (
                        <CheckCircle2 className="w-4.5 h-4.5" style={{ color: c.hex }} />
                      ) : (
                        <a.icon className="w-4 h-4" style={{ color: isActive ? c.hex : 'rgba(255,255,255,0.3)' }} />
                      )}
                    </div>

                    <span className="text-[10px] font-medium transition-colors" style={{ color: isActive ? c.hex : 'rgba(255,255,255,0.4)' }}>
                      {a.label}
                    </span>

                    {areaHistory[a.key] && (
                      <MiniSparkline data={areaHistory[a.key]} color={c.hex} />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Mode Toggle */}
      <motion.div variants={item}>
        <div className="flex items-center justify-center gap-3 py-2">
          <button
            onClick={() => setQuickMode(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
              quickMode
                ? "bg-[#FF4500]/15 text-[#FF4500] border border-[#FF4500]/30"
                : "bg-white/[0.03] text-white/40 border border-white/[0.06] hover:bg-white/[0.05]"
            }`}
          >
            <Zap className="w-4 h-4" />
            Hızlı Giriş
          </button>
          <button
            onClick={() => setQuickMode(false)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
              !quickMode
                ? "bg-[#FF4500]/15 text-[#FF4500] border border-[#FF4500]/30"
                : "bg-white/[0.03] text-white/40 border border-white/[0.06] hover:bg-white/[0.05]"
            }`}
          >
            <ListChecks className="w-4 h-4" />
            Detaylı Giriş
          </button>
        </div>
      </motion.div>

      {/* Quick Entry Mode */}
      {quickMode && (
        <motion.div
          variants={item}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="relative overflow-hidden rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-xl">
            <div className="h-[2px] bg-gradient-to-r from-transparent via-[#FF4500]/40 to-transparent" />
            <div className="p-6 space-y-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-[#FF4500]/15 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-[#FF4500]" />
                </div>
                <div>
                  <h3 className="font-display text-xl text-white tracking-wide">Hızlı Giriş</h3>
                  <p className="text-xs text-white/30">Her alan için 1 puan + opsiyonel not</p>
                </div>
              </div>

              <div className="space-y-4">
                {AREAS.map((a) => {
                  const c = AREA_COLORS[a.key];
                  const rating = quickRatings[a.key] || 5;
                  const percentage = ((rating - 1) / 9) * 100;
                  return (
                    <div key={a.key} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${c.hex}15` }}>
                            <a.icon className="w-3.5 h-3.5" style={{ color: c.hex }} />
                          </div>
                          <Label className="text-sm text-white/70 font-medium">{a.label}</Label>
                        </div>
                        <span className="text-sm font-bold px-2 py-0.5 rounded-md" style={{ color: c.hex, background: `${c.hex}15` }}>
                          {rating}/10
                        </span>
                      </div>
                      <div className="relative h-8 flex items-center">
                        <div className="absolute inset-x-0 h-2 rounded-full bg-white/[0.06] overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${percentage}%`,
                              background: `linear-gradient(to right, ${c.hex}60, ${c.hex})`,
                            }}
                          />
                        </div>
                        <input
                          type="range"
                          min={1}
                          max={10}
                          value={rating}
                          onChange={(e) => setQuickRatings((prev) => ({ ...prev, [a.key]: Number(e.target.value) }))}
                          className="absolute inset-x-0 w-full h-8 opacity-0 cursor-pointer"
                        />
                        <div
                          className="absolute w-5 h-5 rounded-full border-2 shadow-lg pointer-events-none transition-all duration-300"
                          style={{
                            left: `calc(${((rating - 1) / 9) * 100}% - 10px)`,
                            background: c.hex,
                            borderColor: c.hex,
                            boxShadow: `0 0 12px ${c.hex}50`,
                          }}
                        />
                      </div>
                      <Textarea
                        value={quickNotes[a.key] || ""}
                        onChange={(e) => setQuickNotes((prev) => ({ ...prev, [a.key]: e.target.value }))}
                        className="bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 focus:border-white/20 rounded-xl resize-none transition-colors text-sm"
                        rows={1}
                        placeholder={`${a.label} hakkinda kisa not (opsiyonel)`}
                      />
                    </div>
                  );
                })}
              </div>

              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                <Button
                  onClick={handleQuickSaveAll}
                  disabled={quickLoading}
                  className="w-full h-12 text-white font-semibold rounded-xl shadow-lg transition-all duration-300 border-0 bg-gradient-to-r from-[#FF4500] to-[#FF8C00] hover:from-[#FF5500] hover:to-[#FF9C10]"
                  style={{ boxShadow: "0 8px 24px rgba(255,69,0,0.25)" }}
                >
                  {quickLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Kaydediliyor...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Tum Alanlari Kaydet
                    </div>
                  )}
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Area Form (Full/Detailed Mode) */}
      {!quickMode && <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div className="relative overflow-hidden rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-xl">
            {/* Top accent with area color */}
            <div className="h-[2px]" style={{ background: `linear-gradient(to right, transparent, ${colors.hex}80, transparent)` }} />

            <div className="p-6 space-y-5">
              {/* Header */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${colors.hex}15` }}>
                  <area.icon className="w-5 h-5" style={{ color: colors.hex }} />
                </div>
                <div>
                  <h3 className="font-display text-xl text-white tracking-wide">{area.label}</h3>
                  <p className="text-xs text-white/30">{area.fields.length} metrik</p>
                </div>
                {todayStatus[tab] && (
                  <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium" style={{ background: `${colors.hex}15`, color: colors.hex }}>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Girildi
                  </div>
                )}
              </div>

              {/* Fields */}
              <div className="space-y-4">
                {area.fields.map(f => (
                  <div key={f.name}>
                    {f.type === "range" ? (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label className="text-white/50 text-xs uppercase tracking-wider">{f.label}</Label>
                          <span className="text-sm font-bold px-2 py-0.5 rounded-md" style={{ color: colors.hex, background: `${colors.hex}15` }}>
                            {metrics[f.name] || 5}/10
                          </span>
                        </div>
                        {/* Custom range slider */}
                        <div className="relative h-8 flex items-center">
                          <div className="absolute inset-x-0 h-2 rounded-full bg-white/[0.06] overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-300"
                              style={{
                                width: `${((metrics[f.name] || 5) / 10) * 100}%`,
                                background: `linear-gradient(to right, ${colors.hex}60, ${colors.hex})`,
                              }}
                            />
                          </div>
                          <input
                            type="range"
                            min={1}
                            max={10}
                            value={metrics[f.name] || 5}
                            onChange={e => updateMetric(f.name, Number(e.target.value))}
                            className="absolute inset-x-0 w-full h-8 opacity-0 cursor-pointer"
                          />
                          <div
                            className="absolute w-5 h-5 rounded-full border-2 shadow-lg pointer-events-none transition-all duration-300"
                            style={{
                              left: `calc(${((metrics[f.name] || 5) - 1) / 9 * 100}% - 10px)`,
                              background: colors.hex,
                              borderColor: colors.hex,
                              boxShadow: `0 0 12px ${colors.hex}50`,
                            }}
                          />
                        </div>
                      </div>
                    ) : f.type === "textarea" ? (
                      <div className="space-y-2">
                        <Label className="text-white/50 text-xs uppercase tracking-wider">{f.label}</Label>
                        <Textarea
                          value={metrics[f.name] || ""}
                          onChange={e => updateMetric(f.name, e.target.value)}
                          className="bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 focus:border-white/20 rounded-xl resize-none transition-colors"
                          rows={3}
                        />
                      </div>
                    ) : f.type === "checkbox" ? (
                      <motion.button
                        onClick={() => updateMetric(f.name, !metrics[f.name])}
                        whileHover={{ x: 2 }}
                        className="w-full flex items-center justify-between p-3 rounded-xl transition-all duration-300"
                        style={{
                          background: metrics[f.name] ? `${colors.hex}08` : 'rgba(255,255,255,0.02)',
                          border: `1px solid ${metrics[f.name] ? `${colors.hex}30` : 'rgba(255,255,255,0.06)'}`,
                        }}
                      >
                        <Label className="text-white/70 cursor-pointer text-sm">{f.label}</Label>
                        <div
                          className="w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-300"
                          style={{
                            background: metrics[f.name] ? `${colors.hex}20` : 'rgba(255,255,255,0.04)',
                            border: `2px solid ${metrics[f.name] ? colors.hex : 'rgba(255,255,255,0.1)'}`,
                          }}
                        >
                          {metrics[f.name] && (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500 }}>
                              <CheckCircle2 className="w-4 h-4" style={{ color: colors.hex }} />
                            </motion.div>
                          )}
                        </div>
                      </motion.button>
                    ) : (
                      <div className="space-y-2">
                        <Label className="text-white/50 text-xs uppercase tracking-wider">{f.label}</Label>
                        <Input
                          type={f.type}
                          value={metrics[f.name] || ""}
                          onChange={e => updateMetric(f.name, f.type === "number" ? Number(e.target.value) : e.target.value)}
                          className="bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 focus:border-white/20 h-11 rounded-xl transition-colors"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Photo Upload */}
              <div className="border-t border-white/[0.06] pt-5">
                <Label className="text-white/50 text-xs uppercase tracking-wider flex items-center gap-2 mb-3">
                  <Camera className="w-3.5 h-3.5" style={{ color: colors.hex }} /> Fotograf Kaniti
                </Label>
                <div className="flex flex-wrap gap-3 mb-3">
                  {photoUrls.map((url, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative group w-20 h-20 rounded-xl overflow-hidden border border-white/[0.08] cursor-pointer shadow-lg"
                      onClick={() => setPreviewImage(url)}
                    >
                      <img src={url} alt="" className="w-full h-full object-cover" loading="lazy" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300" />
                      <button
                        onClick={e => { e.stopPropagation(); removePhoto(url); }}
                        className="absolute top-1 right-1 bg-red-500/80 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-500"
                      >
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </motion.div>
                  ))}
                  <label
                    className="w-20 h-20 rounded-xl border-2 border-dashed flex items-center justify-center cursor-pointer transition-all duration-300 hover:border-opacity-60"
                    style={{ borderColor: `${colors.hex}30` }}
                  >
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                    {uploading ? (
                      <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: `${colors.hex}30`, borderTopColor: colors.hex }} />
                    ) : (
                      <Camera className="w-5 h-5 text-white/20" />
                    )}
                  </label>
                </div>
              </div>

              {/* Save Button */}
              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                <Button
                  onClick={handleSave}
                  disabled={loading}
                  className="w-full h-12 text-white font-semibold rounded-xl shadow-lg transition-all duration-300 border-0"
                  style={{
                    background: `linear-gradient(135deg, ${colors.hex}, ${colors.hex}CC)`,
                    boxShadow: `0 8px 24px ${colors.hex}25`,
                  }}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Kaydediliyor...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Kaydet
                    </div>
                  )}
                </Button>
              </motion.div>
            </div>
          </div>

          {/* History */}
          {history.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="mt-4"
            >
              <div className="relative overflow-hidden rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-xl">
                <div className="h-[2px]" style={{ background: `linear-gradient(to right, transparent, ${colors.hex}30, transparent)` }} />
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-4 h-4" style={{ color: colors.hex }} />
                    <h4 className="font-display text-lg text-white tracking-wide">Son 7 Giriş</h4>
                  </div>
                  <div className="space-y-2">
                    {history.map((h, idx) => (
                      <motion.div
                        key={h.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.04 }}
                        className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full" style={{ background: colors.hex }} />
                          <span className="text-white/70 text-sm">{format(new Date(h.entry_date), "d MMM")}</span>
                          {((h.photo_urls as string[]) || []).length > 0 && (
                            <Image className="w-3.5 h-3.5" style={{ color: `${colors.hex}80` }} />
                          )}
                        </div>
                        <span className="text-white/30 text-xs bg-white/[0.04] px-2 py-0.5 rounded-md">
                          {Object.keys(h.metrics || {}).length} metrik
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>}

      {/* Image Preview Modal */}
      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setPreviewImage(null)}
          >
            <motion.img
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              src={previewImage}
              alt=""
              className="max-w-full max-h-[80vh] rounded-2xl shadow-2xl"
            />
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-6 right-6 p-3 bg-white/[0.06] border border-white/[0.1] rounded-xl backdrop-blur-xl hover:bg-white/[0.1] transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default LifeAreas;
