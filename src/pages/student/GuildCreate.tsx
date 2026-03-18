import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Plus,
  X,
  Flame,
  Shield,
  Swords,
  Mountain,
  Crown,
  Bird,
  Cat,
  Skull,
  Link2,
  Hexagon,
  Lock,
  Globe,
  FileText,
  Users,
  TrendingUp,
  Sparkles,
  Eye,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { GuildType, EmblemConfig, GuildRule } from "@/types/guild";

// ============================================
// CONSTANTS
// ============================================

const STEPS = [
  { id: 1, title: "Temel Bilgiler", subtitle: "İsim, motto ve tür" },
  { id: 2, title: "Kurallar & Gereksinimler", subtitle: "Katılım koşulları" },
  { id: 3, title: "Arma Tasarımı", subtitle: "Sembol, renk ve çerçeve" },
  { id: 4, title: "Önizleme & Oluştur", subtitle: "Son kontrol" },
];

const GUILD_TYPE_OPTIONS: {
  value: GuildType;
  label: string;
  description: string;
  icon: typeof Globe;
}[] = [
  {
    value: "open",
    label: "Açık",
    description: "Herkes katılabilir",
    icon: Globe,
  },
  {
    value: "application",
    label: "Başvurulu",
    description: "Başvuru onayı gerekir",
    icon: FileText,
  },
  {
    value: "invite",
    label: "Davetli",
    description: "Sadece davetliler katılabilir",
    icon: Lock,
  },
];

const SYMBOLS = [
  { id: "kartal", label: "Kartal", icon: Bird },
  { id: "kurt", label: "Kurt", icon: Cat },
  { id: "aslan", label: "Aslan", icon: Crown },
  { id: "anka", label: "Anka", icon: Sparkles },
  { id: "kilic", label: "Kılıç", icon: Swords },
  { id: "kalkan", label: "Kalkan", icon: Shield },
  { id: "dag", label: "Dağ", icon: Mountain },
  { id: "ates", label: "Ateş", icon: Flame },
  { id: "ors", label: "Örs", icon: Hexagon },
  { id: "zincir", label: "Zincir", icon: Link2 },
];

const COLOR_PALETTE = [
  { id: "ember", value: "#FF4500", label: "Ember" },
  { id: "gold", value: "#FFD700", label: "Gold" },
  { id: "crimson", value: "#DC143C", label: "Crimson" },
  { id: "royal", value: "#7B2FBE", label: "Royal" },
  { id: "ocean", value: "#0077B6", label: "Ocean" },
  { id: "emerald", value: "#10B981", label: "Emerald" },
  { id: "silver", value: "#C0C0C0", label: "Silver" },
  { id: "obsidian", value: "#1A1A2E", label: "Obsidian" },
];

const FRAME_STYLES = [
  { id: "gotik", label: "Gotik" },
  { id: "askeri", label: "Askeri" },
  { id: "antik", label: "Antik" },
  { id: "minimal", label: "Minimal" },
  { id: "tribal", label: "Tribal" },
];

const PHASE_OPTIONS = [
  { value: 1, label: "Faz 1" },
  { value: 2, label: "Faz 2" },
  { value: 3, label: "Faz 3" },
];

// ============================================
// HELPER
// ============================================

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// ============================================
// ANIMATION VARIANTS
// ============================================

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
  }),
};

// ============================================
// FRAME STYLE RENDERERS
// ============================================

function getFrameClasses(frameStyle: string): string {
  switch (frameStyle) {
    case "gotik":
      return "rounded-none border-2";
    case "askeri":
      return "rounded-lg border-[3px]";
    case "antik":
      return "rounded-full border-2 border-double";
    case "minimal":
      return "rounded-xl border";
    case "tribal":
      return "rounded-2xl border-2 border-dashed";
    default:
      return "rounded-xl border";
  }
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function GuildCreate() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1 state
  const [name, setName] = useState("");
  const [motto, setMotto] = useState("");
  const [description, setDescription] = useState("");
  const [guildType, setGuildType] = useState<GuildType>("open");

  // Step 2 state
  const [rules, setRules] = useState<GuildRule[]>([]);
  const [newRule, setNewRule] = useState("");
  const [minStreak, setMinStreak] = useState(0);
  const [minPhase, setMinPhase] = useState(1);
  const [minScore, setMinScore] = useState(0);

  // Step 3 state
  const [selectedSymbol, setSelectedSymbol] = useState("kalkan");
  const [selectedColors, setSelectedColors] = useState<string[]>(["#FF4500"]);
  const [frameStyle, setFrameStyle] = useState("minimal");

  // ---- Validation ----
  const isStep1Valid = name.trim().length >= 3 && name.trim().length <= 24;

  const canProceed = useCallback((): boolean => {
    switch (currentStep) {
      case 1:
        return isStep1Valid;
      case 2:
        return true;
      case 3:
        return selectedColors.length >= 1;
      case 4:
        return true;
      default:
        return false;
    }
  }, [currentStep, isStep1Valid, selectedColors.length]);

  // ---- Navigation ----
  const goNext = () => {
    if (currentStep < 4 && canProceed()) {
      setDirection(1);
      setCurrentStep((s) => s + 1);
    }
  };

  const goBack = () => {
    if (currentStep > 1) {
      setDirection(-1);
      setCurrentStep((s) => s - 1);
    }
  };

  // ---- Rules management ----
  const addRule = () => {
    const text = newRule.trim();
    if (!text) return;
    setRules((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        text,
        created_at: new Date().toISOString(),
      },
    ]);
    setNewRule("");
  };

  const removeRule = (id: string) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
  };

  // ---- Color toggle ----
  const toggleColor = (color: string) => {
    setSelectedColors((prev) => {
      if (prev.includes(color)) {
        if (prev.length <= 1) return prev; // keep at least 1
        return prev.filter((c) => c !== color);
      }
      if (prev.length >= 3) return prev; // max 3
      return [...prev, color];
    });
  };

  // ---- Submit ----
  const handleCreate = async () => {
    if (!user) return;
    setIsSubmitting(true);
    setError(null);

    const slug = generateSlug(name);
    const emblemConfig: EmblemConfig = {
      symbol: selectedSymbol,
      colors: selectedColors,
      frame_style: frameStyle,
      slogan: motto || undefined,
    };

    try {
      // Create guild
      const { data: guild, error: guildError } = await supabase
        .from("guilds")
        .insert({
          name: name.trim(),
          slug,
          motto: motto.trim() || null,
          description: description.trim() || null,
          emblem_config: emblemConfig,
          guild_type: guildType,
          rules,
          min_streak_requirement: minStreak,
          min_phase_requirement: minPhase,
          min_score_requirement: minScore,
          founder_id: user.id,
        })
        .select("id")
        .single();

      if (guildError) throw guildError;

      // Add founder as blacksmith member
      const { error: memberError } = await supabase
        .from("guild_members")
        .insert({
          guild_id: guild.id,
          user_id: user.id,
          role: "blacksmith",
        });

      if (memberError) throw memberError;

      navigate(`/guilds/${slug}`);
    } catch (err: any) {
      console.error("Guild creation failed:", err);
      setError(err.message || "Lonca oluşturulamadı. Tekrar deneyin.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---- Get symbol icon component ----
  const getSymbolIcon = (symbolId: string) => {
    const found = SYMBOLS.find((s) => s.id === symbolId);
    return found?.icon || Shield;
  };

  const SymbolIcon = getSymbolIcon(selectedSymbol);

  // ============================================
  // RENDER STEPS
  // ============================================

  const renderStep1 = () => (
    <div className="space-y-6">
      {/* Guild name */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Lonca Adı <span className="text-primary">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Örn: IRON WOLVES"
          maxLength={24}
          className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40 focus:bg-white/[0.06] transition-all text-sm backdrop-blur-sm font-display tracking-wider uppercase"
        />
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            3-24 karakter, benzersiz olmalı
          </p>
          <span
            className={`text-xs ${
              name.length >= 3 && name.length <= 24
                ? "text-emerald-400"
                : "text-muted-foreground"
            }`}
          >
            {name.length}/24
          </span>
        </div>
      </div>

      {/* Motto */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Lonca Mottosu
        </label>
        <input
          type="text"
          value={motto}
          onChange={(e) => setMotto(e.target.value)}
          placeholder="Ateşten geçmeyen çelik olmaz"
          maxLength={100}
          className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40 focus:bg-white/[0.06] transition-all text-sm backdrop-blur-sm italic"
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Açıklama</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Loncanızı birkaç cümleyle tanımlayın..."
          rows={3}
          maxLength={500}
          className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40 focus:bg-white/[0.06] transition-all text-sm backdrop-blur-sm resize-none"
        />
      </div>

      {/* Guild type */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">
          Lonca Türü
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {GUILD_TYPE_OPTIONS.map((opt) => {
            const isSelected = guildType === opt.value;
            return (
              <motion.button
                key={opt.value}
                type="button"
                onClick={() => setGuildType(opt.value)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`relative p-4 rounded-xl text-left transition-all ${
                  isSelected
                    ? "bg-primary/[0.08] border-primary/40"
                    : "bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.05]"
                } border backdrop-blur-sm`}
              >
                {isSelected && (
                  <motion.div
                    layoutId="guild-type-glow"
                    className="absolute inset-0 rounded-xl"
                    style={{
                      boxShadow: "0 0 20px rgba(255,69,0,0.15)",
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <div className="relative">
                  <opt.icon
                    size={20}
                    className={
                      isSelected ? "text-primary mb-2" : "text-muted-foreground mb-2"
                    }
                  />
                  <p
                    className={`text-sm font-semibold ${
                      isSelected ? "text-primary" : "text-foreground"
                    }`}
                  >
                    {opt.label}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {opt.description}
                  </p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      {/* Custom rules */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">
          Lonca Kuralları
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={newRule}
            onChange={(e) => setNewRule(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addRule()}
            placeholder="Yeni kural ekle..."
            maxLength={200}
            className="flex-1 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40 focus:bg-white/[0.06] transition-all text-sm backdrop-blur-sm"
          />
          <motion.button
            type="button"
            onClick={addRule}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-3 rounded-xl bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 transition-colors"
          >
            <Plus size={18} />
          </motion.button>
        </div>

        {/* Rules list */}
        <AnimatePresence>
          {rules.map((rule, i) => (
            <motion.div
              key={rule.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <span className="text-xs text-primary font-mono font-semibold">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex-1 text-sm text-foreground">
                  {rule.text}
                </span>
                <button
                  type="button"
                  onClick={() => removeRule(rule.id)}
                  className="text-muted-foreground hover:text-red-400 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {rules.length === 0 && (
          <p className="text-xs text-muted-foreground/60 italic pl-1">
            Henüz kural eklenmedi.
          </p>
        )}
      </div>

      {/* Requirements */}
      <div className="space-y-4 pt-2">
        <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
          <Shield size={16} className="text-primary" />
          Katılım Gereksinimleri
        </h3>

        {/* Minimum streak */}
        <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <div>
            <p className="text-sm text-foreground">Minimum Streak</p>
            <p className="text-xs text-muted-foreground">
              Ardışık gün sayısı
            </p>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              type="button"
              whileTap={{ scale: 0.9 }}
              onClick={() => setMinStreak(Math.max(0, minStreak - 1))}
              className="h-8 w-8 rounded-lg bg-white/[0.06] border border-white/[0.1] flex items-center justify-center text-foreground hover:bg-white/[0.1] transition-colors text-sm"
            >
              -
            </motion.button>
            <span className="w-10 text-center font-mono text-sm text-foreground">
              {minStreak}
            </span>
            <motion.button
              type="button"
              whileTap={{ scale: 0.9 }}
              onClick={() => setMinStreak(minStreak + 1)}
              className="h-8 w-8 rounded-lg bg-white/[0.06] border border-white/[0.1] flex items-center justify-center text-foreground hover:bg-white/[0.1] transition-colors text-sm"
            >
              +
            </motion.button>
          </div>
        </div>

        {/* Minimum phase */}
        <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <div>
            <p className="text-sm text-foreground">Minimum Faz</p>
            <p className="text-xs text-muted-foreground">
              Gerekli minimum faz seviyesi
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            {PHASE_OPTIONS.map((opt) => (
              <motion.button
                key={opt.value}
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={() => setMinPhase(opt.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  minPhase === opt.value
                    ? "bg-primary/20 border-primary/40 text-primary"
                    : "bg-white/[0.04] border-white/[0.08] text-muted-foreground hover:text-foreground"
                } border`}
              >
                {opt.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Minimum score */}
        <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <div>
            <p className="text-sm text-foreground">Minimum Skor</p>
            <p className="text-xs text-muted-foreground">
              Gerekli minimum puan
            </p>
          </div>
          <input
            type="number"
            value={minScore}
            onChange={(e) =>
              setMinScore(Math.max(0, parseInt(e.target.value) || 0))
            }
            min={0}
            step={100}
            className="w-24 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-foreground text-sm text-right focus:outline-none focus:border-primary/40 transition-all font-mono"
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      {/* Symbol selector */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">Sembol</label>
        <div className="grid grid-cols-5 gap-2">
          {SYMBOLS.map((sym) => {
            const isSelected = selectedSymbol === sym.id;
            return (
              <motion.button
                key={sym.id}
                type="button"
                onClick={() => setSelectedSymbol(sym.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`relative flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all ${
                  isSelected
                    ? "bg-primary/[0.1] border-primary/50"
                    : "bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06]"
                } border`}
              >
                {isSelected && (
                  <motion.div
                    layoutId="symbol-glow"
                    className="absolute inset-0 rounded-xl"
                    style={{
                      boxShadow: "0 0 20px rgba(255,69,0,0.2)",
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <sym.icon
                  size={22}
                  className={
                    isSelected ? "text-primary" : "text-muted-foreground"
                  }
                />
                <span
                  className={`text-[10px] ${
                    isSelected
                      ? "text-primary font-medium"
                      : "text-muted-foreground"
                  }`}
                >
                  {sym.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Color palette */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">
          Renkler{" "}
          <span className="text-xs text-muted-foreground font-normal">
            (2-3 seçin)
          </span>
        </label>
        <div className="flex flex-wrap gap-3">
          {COLOR_PALETTE.map((color) => {
            const isSelected = selectedColors.includes(color.value);
            return (
              <motion.button
                key={color.id}
                type="button"
                onClick={() => toggleColor(color.value)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="relative group"
              >
                <div
                  className={`h-10 w-10 rounded-full transition-all ${
                    isSelected
                      ? "ring-2 ring-offset-2 ring-offset-background"
                      : "ring-0 hover:ring-1 hover:ring-white/20 hover:ring-offset-1 hover:ring-offset-background"
                  }`}
                  style={{
                    backgroundColor: color.value,
                    boxShadow: isSelected
                      ? `0 0 16px ${color.value}66`
                      : "none",
                  }}
                />
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <Check size={16} className="text-white drop-shadow-lg" />
                  </motion.div>
                )}
                <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {color.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Frame style */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">
          Çerçeve Stili
        </label>
        <div className="flex flex-wrap gap-2">
          {FRAME_STYLES.map((frame) => {
            const isSelected = frameStyle === frame.id;
            return (
              <motion.button
                key={frame.id}
                type="button"
                onClick={() => setFrameStyle(frame.id)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                  isSelected
                    ? "bg-primary/15 border-primary/50 text-primary"
                    : "bg-white/[0.04] border-white/[0.08] text-muted-foreground hover:text-foreground hover:bg-white/[0.06]"
                } border`}
                style={
                  isSelected
                    ? { boxShadow: "0 0 12px rgba(255,69,0,0.15)" }
                    : {}
                }
              >
                {frame.label}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Live preview */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground flex items-center gap-2">
          <Eye size={14} className="text-primary" />
          Canlı Önizleme
        </label>
        <div className="flex items-center justify-center py-8">
          <motion.div
            key={`${selectedSymbol}-${selectedColors.join()}-${frameStyle}`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="relative"
          >
            {/* Outer glow */}
            <div
              className="absolute inset-0 blur-2xl opacity-30"
              style={{
                background: `radial-gradient(circle, ${
                  selectedColors[0] || "#FF4500"
                }, transparent)`,
              }}
            />

            {/* Emblem container */}
            <div
              className={`relative h-32 w-32 flex items-center justify-center ${getFrameClasses(
                frameStyle
              )}`}
              style={{
                borderColor: selectedColors[0] || "#FF4500",
                background:
                  selectedColors.length >= 2
                    ? `linear-gradient(135deg, ${selectedColors[0]}22, ${selectedColors[1]}22)`
                    : `${selectedColors[0] || "#FF4500"}11`,
              }}
            >
              {/* Inner gradient ring */}
              {selectedColors.length >= 2 && (
                <div
                  className="absolute inset-1 opacity-30"
                  style={{
                    background: `linear-gradient(45deg, ${selectedColors
                      .map((c) => c + "44")
                      .join(", ")})`,
                    borderRadius: "inherit",
                  }}
                />
              )}

              {/* Symbol */}
              <SymbolIcon
                size={48}
                strokeWidth={1.5}
                style={{ color: selectedColors[0] || "#FF4500" }}
                className="relative z-10"
              />
            </div>

            {/* Label */}
            <p className="text-center mt-3 text-xs text-muted-foreground">
              {SYMBOLS.find((s) => s.id === selectedSymbol)?.label} /{" "}
              {FRAME_STYLES.find((f) => f.id === frameStyle)?.label}
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => {
    const typeLabel =
      GUILD_TYPE_OPTIONS.find((o) => o.value === guildType)?.label || guildType;

    return (
      <div className="space-y-6">
        {/* Guild card preview */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">
            Lonca Kartı Önizleme
          </label>

          <div className="relative rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl overflow-hidden">
            {/* Top accent */}
            <div
              className="h-[2px] w-full"
              style={{
                background: `linear-gradient(90deg, transparent, ${
                  selectedColors[0] || "#FF4500"
                }, transparent)`,
              }}
            />

            <div className="p-5">
              <div className="flex items-start gap-4">
                {/* Emblem */}
                <div
                  className={`h-16 w-16 flex items-center justify-center shrink-0 relative overflow-hidden ${getFrameClasses(
                    frameStyle
                  )}`}
                  style={{
                    background:
                      selectedColors.length >= 2
                        ? `linear-gradient(135deg, ${selectedColors[0]}15, ${selectedColors[1]}05)`
                        : `${selectedColors[0] || "#FF4500"}10`,
                    borderColor: `${selectedColors[0] || "#FF4500"}55`,
                  }}
                >
                  <SymbolIcon
                    size={28}
                    style={{ color: selectedColors[0] || "#FF4500" }}
                    strokeWidth={1.5}
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-lg text-foreground tracking-wide uppercase">
                    {name || "LONCA ADI"}
                  </h3>
                  {motto && (
                    <p className="text-xs text-muted-foreground italic truncate">
                      "{motto}"
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-muted-foreground bg-white/[0.04] px-2 py-0.5 rounded-md border border-white/[0.06]">
                      Lv.1 Spark
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Bronze
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats row */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/[0.06]">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Users size={14} />
                  <span className="text-xs">1/5</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Flame size={14} />
                  <span className="text-xs">Heat 0</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <TrendingUp size={14} />
                  <span className="text-xs">0 SP</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary details */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">
            Özet Bilgiler
          </label>

          <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] divide-y divide-white/[0.06]">
            <SummaryRow label="Lonca Adı" value={name.trim().toUpperCase()} />
            <SummaryRow
              label="Motto"
              value={motto.trim() || "—"}
              italic
            />
            <SummaryRow label="Tür" value={typeLabel} />
            <SummaryRow
              label="Kurallar"
              value={`${rules.length} kural`}
            />
            <SummaryRow label="Min. Streak" value={`${minStreak} gün`} />
            <SummaryRow label="Min. Faz" value={`Faz ${minPhase}`} />
            <SummaryRow label="Min. Skor" value={`${minScore} puan`} />
            <SummaryRow
              label="Sembol"
              value={
                SYMBOLS.find((s) => s.id === selectedSymbol)?.label || "—"
              }
            />
            <SummaryRow
              label="Çerçeve"
              value={
                FRAME_STYLES.find((f) => f.id === frameStyle)?.label || "—"
              }
            />
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-xs text-muted-foreground">Renkler</span>
              <div className="flex items-center gap-1.5">
                {selectedColors.map((c) => (
                  <div
                    key={c}
                    className="h-4 w-4 rounded-full border border-white/20"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
          >
            {error}
          </motion.div>
        )}

        {/* Create button */}
        <motion.button
          type="button"
          onClick={handleCreate}
          disabled={isSubmitting}
          whileHover={{ scale: 1.01, boxShadow: "0 0 40px rgba(255,69,0,0.3)" }}
          whileTap={{ scale: 0.99 }}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-primary via-orange-500 to-primary text-black font-display text-lg tracking-wider disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
        >
          {/* Shine animation */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"
          />
          <span className="relative flex items-center justify-center gap-2">
            {isSubmitting ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Flame size={20} />
                </motion.div>
                DÖVÜLÜYOR...
              </>
            ) : (
              <>
                <Flame size={20} />
                LONCAYI KUR
              </>
            )}
          </span>
        </motion.button>
      </div>
    );
  };

  // ============================================
  // MAIN RENDER
  // ============================================

  return (
    <div className="min-h-screen pb-20 relative">
      {/* Background glow orbs */}
      <div className="fixed top-20 left-1/4 w-96 h-96 bg-primary/[0.04] rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed bottom-40 right-1/4 w-80 h-80 bg-amber-500/[0.03] rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/[0.02] rounded-full blur-[180px] pointer-events-none" />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative mb-8"
      >
        <button
          onClick={() => navigate("/guilds")}
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors text-sm mb-4"
        >
          <ChevronLeft size={16} />
          Loncalara Dön
        </button>

        <h1 className="font-display text-4xl md:text-5xl tracking-wider text-foreground">
          LONCA KUR
        </h1>
        <p className="text-muted-foreground mt-2 max-w-md">
          Kendi loncanı kur, ocağını yak, birlikte dövün.
        </p>
      </motion.div>

      {/* Progress Steps */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="mb-10"
      >
        <div className="flex items-center justify-between relative">
          {/* Connecting line */}
          <div className="absolute top-5 left-0 right-0 h-[2px] bg-white/[0.06]" />
          <motion.div
            className="absolute top-5 left-0 h-[2px] bg-gradient-to-r from-primary to-primary/50"
            initial={{ width: "0%" }}
            animate={{
              width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%`,
            }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          />

          {STEPS.map((step) => {
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;

            return (
              <div
                key={step.id}
                className="relative flex flex-col items-center z-10"
              >
                <motion.div
                  animate={{
                    scale: isActive ? 1 : 0.9,
                    boxShadow: isActive
                      ? "0 0 20px rgba(255,69,0,0.4)"
                      : "none",
                  }}
                  className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                    isActive
                      ? "bg-primary text-black"
                      : isCompleted
                      ? "bg-primary/20 border border-primary/50 text-primary"
                      : "bg-white/[0.06] border border-white/[0.1] text-muted-foreground"
                  }`}
                >
                  {isCompleted ? <Check size={16} /> : step.id}
                </motion.div>
                <div className="mt-2 text-center hidden sm:block">
                  <p
                    className={`text-xs font-medium ${
                      isActive
                        ? "text-primary"
                        : isCompleted
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {step.title}
                  </p>
                  <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                    {step.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile step title */}
        <div className="sm:hidden mt-4 text-center">
          <p className="text-sm font-medium text-primary">
            {STEPS[currentStep - 1].title}
          </p>
          <p className="text-xs text-muted-foreground">
            {STEPS[currentStep - 1].subtitle}
          </p>
        </div>
      </motion.div>

      {/* Step content */}
      <div className="relative max-w-2xl mx-auto">
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl p-6 md:p-8 min-h-[400px]">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              {/* Step title */}
              <div className="mb-6">
                <h2 className="font-display text-xl tracking-wider text-foreground">
                  {STEPS[currentStep - 1].title.toUpperCase()}
                </h2>
                <div className="h-[2px] w-12 bg-gradient-to-r from-primary to-transparent mt-2" />
              </div>

              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
              {currentStep === 4 && renderStep4()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation buttons */}
        {currentStep < 4 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-between mt-6"
          >
            <motion.button
              type="button"
              onClick={goBack}
              whileHover={{ x: -2 }}
              whileTap={{ scale: 0.98 }}
              disabled={currentStep === 1}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                currentStep === 1
                  ? "opacity-0 pointer-events-none"
                  : "bg-white/[0.04] border border-white/[0.08] text-muted-foreground hover:text-foreground hover:bg-white/[0.06]"
              }`}
            >
              <ChevronLeft size={16} />
              Geri
            </motion.button>

            <motion.button
              type="button"
              onClick={goNext}
              whileHover={{
                x: 2,
                boxShadow: canProceed()
                  ? "0 0 20px rgba(255,69,0,0.2)"
                  : "none",
              }}
              whileTap={{ scale: 0.98 }}
              disabled={!canProceed()}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                canProceed()
                  ? "bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20"
                  : "bg-white/[0.03] border border-white/[0.06] text-muted-foreground/40 cursor-not-allowed"
              }`}
            >
              İleri
              <ChevronRight size={16} />
            </motion.button>
          </motion.div>
        )}

        {currentStep === 4 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-start mt-6"
          >
            <motion.button
              type="button"
              onClick={goBack}
              whileHover={{ x: -2 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-white/[0.04] border border-white/[0.08] text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-all"
            >
              <ChevronLeft size={16} />
              Geri
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ============================================
// SUB-COMPONENTS
// ============================================

function SummaryRow({
  label,
  value,
  italic = false,
}: {
  label: string;
  value: string;
  italic?: boolean;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span
        className={`text-sm text-foreground ${italic ? "italic" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}
