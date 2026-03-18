import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Flame, ArrowRight, ArrowLeft, CheckCircle2, User, Mail, Phone, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ──────────────────────────────────────────────
   Constants
   ────────────────────────────────────────────── */
const LIFE_AREAS = [
  { key: "physical", label: "Fiziksel Sağlık", desc: "Vücut, fitness, beslenme", color: "#FF4500" },
  { key: "mental", label: "Zihinsel Sağlık", desc: "Odak, disiplin, ruh hali", color: "#FF5722" },
  { key: "style", label: "Stil & Görünüm", desc: "Giyim, bakım, duruş", color: "#FF6B35" },
  { key: "environment", label: "Çevre & Düzen", desc: "Oda, dijital düzen", color: "#FF7043" },
  { key: "social", label: "Sosyal & İlişkiler", desc: "Arkadaşlık, sınırlar", color: "#FF8C00" },
  { key: "career", label: "Kariyer & Üretkenlik", desc: "İş, hedefler", color: "#FF9800" },
  { key: "finance", label: "Finansal Bilinç", desc: "Birikim, harcama", color: "#FFA726" },
];

const COMMITMENT_QUESTIONS = [
  "Neden THE FORGE programına katılmak istiyorsun?",
  "Hayatında en çok değiştirmek istediğin şey ne?",
  "24 hafta boyunca günlük disipline hazır mısın? Neden?",
];

const STEP_LABELS = ["Temel Bilgiler", "Mevcut Durum", "Kararlılık"];

/* ──────────────────────────────────────────────
   Floating Glow Orbs
   ────────────────────────────────────────────── */
const GlowOrb = ({
  size,
  color,
  top,
  left,
  delay = 0,
  duration = 6,
}: {
  size: number;
  color: string;
  top: string;
  left: string;
  delay?: number;
  duration?: number;
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: [0.12, 0.25, 0.12] }}
    transition={{ duration, repeat: Infinity, delay, ease: "easeInOut" }}
    className="absolute rounded-full blur-3xl pointer-events-none"
    style={{ width: size, height: size, background: color, top, left }}
  />
);

/* ──────────────────────────────────────────────
   Ember Particle
   ────────────────────────────────────────────── */
const EmberParticle = ({ index }: { index: number }) => {
  const startX = 10 + Math.random() * 80;
  const size = 2 + Math.random() * 3;
  const duration = 6 + Math.random() * 8;
  const delay = Math.random() * 5;

  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: size,
        height: size,
        left: `${startX}%`,
        bottom: "-5%",
        background: `radial-gradient(circle, rgba(255,69,0,${0.6 + Math.random() * 0.4}), transparent)`,
        boxShadow: `0 0 ${size * 2}px rgba(255,69,0,0.3)`,
      }}
      animate={{
        y: [0, -window.innerHeight * (0.7 + Math.random() * 0.3)],
        x: [0, (Math.random() - 0.5) * 120],
        opacity: [0, 0.8, 0.6, 0],
        scale: [0.5, 1.2, 0.8, 0],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeOut",
      }}
    />
  );
};

/* ──────────────────────────────────────────────
   Animation Variants
   ────────────────────────────────────────────── */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const stepTransition = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
};

/* ──────────────────────────────────────────────
   Apply Component
   ────────────────────────────────────────────── */
const Apply = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState("");

  const [ratings, setRatings] = useState<Record<string, number>>(
    Object.fromEntries(LIFE_AREAS.map(a => [a.key, 5]))
  );

  const [answers, setAnswers] = useState<string[]>(COMMITMENT_QUESTIONS.map(() => ""));

  const handleSubmit = async () => {
    if (answers.some(a => a.trim().length < 10)) {
      toast.error("Lütfen tüm soruları en az 10 karakter ile cevaplayın");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("applications").insert({
      full_name: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      age: parseInt(age),
      situation_ratings: ratings,
      commitment_answers: COMMITMENT_QUESTIONS.map((q, i) => ({ question: q, answer: answers[i] })),
    });
    setLoading(false);
    if (error) {
      toast.error("Başvuru gönderilemedi: " + error.message);
    } else {
      navigate("/application-submitted");
    }
  };

  const renderInputField = (
    icon: React.ReactNode,
    label: string,
    fieldKey: string,
    value: string,
    onChange: (v: string) => void,
    placeholder: string,
    type = "text",
    extraClass = ""
  ) => (
    <div className="space-y-2">
      <Label className="text-xs text-white/40 uppercase tracking-wider font-medium">
        {label}
      </Label>
      <div className="relative group">
        <div
          className={`absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
            focused === fieldKey ? "bg-[#FF4500]/15" : "bg-white/[0.04]"
          }`}
        >
          <div className={`transition-colors duration-300 ${focused === fieldKey ? "text-[#FF4500]" : "text-white/25"}`}>
            {icon}
          </div>
        </div>
        <Input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(fieldKey)}
          onBlur={() => setFocused(null)}
          className={`h-12 pl-14 pr-4 bg-white/[0.03] border-white/[0.08] text-white/90 placeholder:text-white/15 rounded-xl focus:border-[#FF4500]/40 focus:ring-1 focus:ring-[#FF4500]/20 focus:bg-white/[0.05] transition-all duration-300 ${extraClass}`}
          placeholder={placeholder}
        />
        {focused === fieldKey && (
          <motion.div
            layoutId="applyInputGlow"
            className="absolute inset-0 rounded-xl pointer-events-none"
            style={{
              boxShadow: "0 0 20px rgba(255,69,0,0.08), inset 0 0 20px rgba(255,69,0,0.03)",
            }}
          />
        )}
      </div>
    </div>
  );

  return (
    <div className="relative min-h-screen bg-[#060608] flex items-center justify-center p-4 overflow-hidden">
      {/* ═══ Background Effects ═══ */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,69,0,0.04)_0%,transparent_70%)]" />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Glow Orbs */}
      <GlowOrb size={400} color="rgba(255,69,0,0.07)" top="-10%" left="50%" delay={0} />
      <GlowOrb size={300} color="rgba(255,69,0,0.05)" top="60%" left="-5%" delay={2} />
      <GlowOrb size={250} color="rgba(255,140,0,0.04)" top="30%" left="80%" delay={4} />
      <GlowOrb size={200} color="rgba(255,69,0,0.06)" top="80%" left="60%" delay={1} duration={8} />

      {/* Ember Particles */}
      {Array.from({ length: 12 }, (_, i) => (
        <EmberParticle key={i} index={i} />
      ))}

      {/* ═══ Main Content ═══ */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-lg"
      >
        {/* Logo */}
        <motion.div variants={itemVariants} className="text-center mb-8">
          <Link to="/" className="inline-flex flex-col items-center gap-3 group">
            <motion.div
              className="relative"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.div
                animate={{
                  boxShadow: [
                    "0 0 20px rgba(255,69,0,0.3), 0 0 60px rgba(255,69,0,0.1)",
                    "0 0 30px rgba(255,69,0,0.5), 0 0 80px rgba(255,69,0,0.15)",
                    "0 0 20px rgba(255,69,0,0.3), 0 0 60px rgba(255,69,0,0.1)",
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FF4500] via-[#FF6B35] to-[#FF8C00] flex items-center justify-center"
              >
                <Flame className="w-7 h-7 text-white" />
              </motion.div>
              <motion.div
                animate={{ opacity: [0.2, 0.4, 0.2], scale: [1, 1.1, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 rounded-2xl border border-[#FF4500]/20"
                style={{ margin: "-4px" }}
              />
            </motion.div>
            <div>
              <h1 className="font-display text-3xl text-white tracking-[0.15em]">THE FORGE</h1>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: 0.8, duration: 0.6, ease: "easeOut" }}
                className="h-[1px] bg-gradient-to-r from-transparent via-[#FF4500]/50 to-transparent mt-2"
              />
            </div>
          </Link>
          <motion.p variants={itemVariants} className="text-white/30 text-sm mt-3 tracking-wide">
            Programa basvur
          </motion.p>
        </motion.div>

        {/* Step Progress Indicator */}
        <motion.div variants={itemVariants} className="flex items-center justify-center gap-0 mb-8">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center">
              <div className="flex flex-col items-center gap-1.5">
                <motion.div
                  animate={s === step ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 ${
                    s === step
                      ? "bg-gradient-to-br from-[#FF4500] to-[#FF6B35] text-white shadow-[0_0_20px_rgba(255,69,0,0.4)]"
                      : s < step
                      ? "bg-[#FF4500]/20 text-[#FF4500] border border-[#FF4500]/30"
                      : "bg-white/[0.04] text-white/25 border border-white/[0.08]"
                  }`}
                >
                  {s < step ? <CheckCircle2 className="w-5 h-5" /> : s}
                </motion.div>
                <span className={`text-[10px] uppercase tracking-wider ${
                  s === step ? "text-[#FF4500]" : s < step ? "text-white/40" : "text-white/15"
                }`}>
                  {STEP_LABELS[s - 1]}
                </span>
              </div>
              {s < 3 && (
                <div className="relative w-16 h-[2px] mx-2 mb-5">
                  <div className="absolute inset-0 bg-white/[0.06] rounded-full" />
                  <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: s < step ? "100%" : "0%" }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#FF4500] to-[#FF6B35] rounded-full"
                  />
                </div>
              )}
            </div>
          ))}
        </motion.div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {/* ═══ Step 1: Basic Info ═══ */}
          {step === 1 && (
            <motion.div
              key="step1"
              {...stepTransition}
              className="relative"
            >
              <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-b from-white/[0.08] via-white/[0.03] to-white/[0.01] pointer-events-none" />
              <div className="relative bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-8 space-y-6">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-[#FF4500]/20 to-transparent" />

                <div>
                  <h2 className="font-display text-2xl text-white tracking-wide">Temel Bilgiler</h2>
                  <p className="text-sm text-white/30 mt-1">Seni tanımamız için gerekli bilgiler.</p>
                </div>

                {renderInputField(
                  <User className="w-4 h-4" />, "Ad Soyad", "fullName",
                  fullName, setFullName, "Adın Soyadın"
                )}
                {renderInputField(
                  <Mail className="w-4 h-4" />, "E-posta", "email",
                  email, setEmail, "email@ornek.com", "email"
                )}
                {renderInputField(
                  <Phone className="w-4 h-4" />, "Telefon", "phone",
                  phone, setPhone, "05XX XXX XX XX"
                )}
                {renderInputField(
                  <Calendar className="w-4 h-4" />, "Yaş", "age",
                  age, setAge, "25", "number", "w-32"
                )}

                <Button
                  onClick={() => {
                    if (!fullName.trim() || !email.trim() || !age) {
                      toast.error("Lütfen zorunlu alanları doldurun");
                      return;
                    }
                    setStep(2);
                  }}
                  className="relative w-full h-12 rounded-xl bg-gradient-to-r from-[#FF4500] to-[#FF6B35] hover:from-[#FF5500] hover:to-[#FF7B45] text-white font-medium text-sm border-0 shadow-[0_0_30px_rgba(255,69,0,0.25)] hover:shadow-[0_0_50px_rgba(255,69,0,0.4)] transition-all duration-300 group overflow-hidden"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                    initial={{ x: "-100%" }}
                    animate={{ x: "200%" }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
                  />
                  <span className="flex items-center justify-center gap-2 relative z-10">
                    Devam Et <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                  </span>
                </Button>
              </div>
            </motion.div>
          )}

          {/* ═══ Step 2: Life Area Ratings ═══ */}
          {step === 2 && (
            <motion.div
              key="step2"
              {...stepTransition}
              className="relative"
            >
              <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-b from-white/[0.08] via-white/[0.03] to-white/[0.01] pointer-events-none" />
              <div className="relative bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-8 space-y-5">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-[#FF4500]/20 to-transparent" />

                <div>
                  <h2 className="font-display text-2xl text-white tracking-wide">Mevcut Durum</h2>
                  <p className="text-sm text-white/30 mt-1">Her alanı 1-10 arasında değerlendir</p>
                </div>

                {LIFE_AREAS.map((area, idx) => (
                  <motion.div
                    key={area.key}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm text-white/80 font-medium">{area.label}</span>
                        <p className="text-[11px] text-white/25">{area.desc}</p>
                      </div>
                      <div
                        className="text-sm font-bold min-w-[2.5rem] text-center py-1 px-2 rounded-lg"
                        style={{
                          color: area.color,
                          background: `${area.color}15`,
                        }}
                      >
                        {ratings[area.key]}
                      </div>
                    </div>
                    <div className="relative h-2 rounded-full bg-white/[0.06] overflow-hidden">
                      <motion.div
                        className="absolute inset-y-0 left-0 rounded-full"
                        style={{
                          background: `linear-gradient(90deg, ${area.color}80, ${area.color})`,
                          boxShadow: `0 0 12px ${area.color}40`,
                        }}
                        initial={{ width: "50%" }}
                        animate={{ width: `${ratings[area.key] * 10}%` }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                      />
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={ratings[area.key]}
                      onChange={e => setRatings(r => ({ ...r, [area.key]: Number(e.target.value) }))}
                      className="w-full h-2 appearance-none cursor-pointer bg-transparent relative z-10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(255,69,0,0.5)] [&::-webkit-slider-thumb]:cursor-pointer"
                      style={{
                        // @ts-expect-error -- vendor prefix
                        "--thumb-border": area.color,
                        marginTop: "-10px",
                      }}
                    />
                  </motion.div>
                ))}

                <div className="flex gap-3 pt-2">
                  <Button
                    variant="ghost"
                    onClick={() => setStep(1)}
                    className="flex-1 h-12 rounded-xl border border-white/[0.08] bg-white/[0.03] text-white/60 hover:text-white hover:bg-white/[0.06] transition-all duration-300"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Geri
                  </Button>
                  <Button
                    onClick={() => setStep(3)}
                    className="flex-1 h-12 rounded-xl bg-gradient-to-r from-[#FF4500] to-[#FF6B35] hover:from-[#FF5500] hover:to-[#FF7B45] text-white font-medium text-sm border-0 shadow-[0_0_30px_rgba(255,69,0,0.25)] hover:shadow-[0_0_50px_rgba(255,69,0,0.4)] transition-all duration-300"
                  >
                    Devam Et <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══ Step 3: Commitment ═══ */}
          {step === 3 && (
            <motion.div
              key="step3"
              {...stepTransition}
              className="relative"
            >
              <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-b from-white/[0.08] via-white/[0.03] to-white/[0.01] pointer-events-none" />
              <div className="relative bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-8 space-y-6">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-[#FF4500]/20 to-transparent" />

                <div>
                  <h2 className="font-display text-2xl text-white tracking-wide">Kararlılık</h2>
                  <p className="text-sm text-white/30 mt-1">Bu sorular motivasyonunu anlamamız için önemli.</p>
                </div>

                {COMMITMENT_QUESTIONS.map((q, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="space-y-2"
                  >
                    <Label className="text-xs text-white/40 uppercase tracking-wider font-medium">
                      {q}
                    </Label>
                    <div className="relative">
                      <Textarea
                        value={answers[i]}
                        onChange={e => {
                          const a = [...answers];
                          a[i] = e.target.value;
                          setAnswers(a);
                        }}
                        onFocus={() => setFocused(`q${i}`)}
                        onBlur={() => setFocused(null)}
                        className="bg-white/[0.03] border-white/[0.08] text-white/90 placeholder:text-white/15 rounded-xl focus:border-[#FF4500]/40 focus:ring-1 focus:ring-[#FF4500]/20 focus:bg-white/[0.05] transition-all duration-300 min-h-[100px] resize-none"
                        rows={3}
                        placeholder="Cevabını yaz..."
                      />
                      {focused === `q${i}` && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="absolute inset-0 rounded-xl pointer-events-none"
                          style={{
                            boxShadow: "0 0 20px rgba(255,69,0,0.08), inset 0 0 20px rgba(255,69,0,0.03)",
                          }}
                        />
                      )}
                    </div>
                    <div className="flex justify-end">
                      <span className={`text-[10px] ${answers[i].trim().length >= 10 ? "text-[#FF4500]/50" : "text-white/15"}`}>
                        {answers[i].trim().length}/10 min
                      </span>
                    </div>
                  </motion.div>
                ))}

                <div className="flex gap-3 pt-2">
                  <Button
                    variant="ghost"
                    onClick={() => setStep(2)}
                    className="flex-1 h-12 rounded-xl border border-white/[0.08] bg-white/[0.03] text-white/60 hover:text-white hover:bg-white/[0.06] transition-all duration-300"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Geri
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="relative flex-1 h-12 rounded-xl bg-gradient-to-r from-[#FF4500] to-[#FF6B35] hover:from-[#FF5500] hover:to-[#FF7B45] text-white font-medium text-sm border-0 shadow-[0_0_30px_rgba(255,69,0,0.25)] hover:shadow-[0_0_50px_rgba(255,69,0,0.4)] transition-all duration-300 group overflow-hidden"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                      initial={{ x: "-100%" }}
                      animate={{ x: "200%" }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
                    />
                    {loading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                      />
                    ) : (
                      <span className="flex items-center justify-center gap-2 relative z-10">
                        Başvuruyu Gönder
                        <Flame className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom decorative line */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-8 flex justify-center"
        >
          <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Apply;
