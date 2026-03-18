import { motion } from "framer-motion";
import { Check, Flame, Shield, Swords, ArrowLeft, Star } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";

// ============================================
// Lemon Squeezy Checkout URLs
// ============================================

const CHECKOUT_URLS: Record<string, string> = {
  ates: import.meta.env.VITE_LS_CHECKOUT_ATES || "#",
  celik: import.meta.env.VITE_LS_CHECKOUT_CELIK || "#",
  kilic: import.meta.env.VITE_LS_CHECKOUT_KILIC || "#",
};

// ============================================
// Tier Data
// ============================================

interface PricingTier {
  key: string;
  name: string;
  price: string;
  priceSuffix?: string;
  description: string;
  features: string[];
  cta: string;
  popular: boolean;
  icon: React.ElementType;
  color: string;
  glow: string;
}

const TIERS: PricingTier[] = [
  {
    key: "ates",
    name: "Ateş",
    price: "Ücretsiz",
    priceSuffix: "7 gün deneme",
    description: "İlk adımını at, ocağın ısısını hisset.",
    features: [
      "Günlük check-in",
      "Temel görevler",
      "Topluluk erişimi",
      "İlerleme takibi",
      "7 günlük tam erişim",
    ],
    cta: "Başla",
    popular: false,
    icon: Flame,
    color: "#FF8C00",
    glow: "rgba(255,140,0,0.3)",
  },
  {
    key: "celik",
    name: "Çelik",
    price: "₺999",
    priceSuffix: "/ay",
    description: "Tam dönüşüm programı. Disiplin burada başlar.",
    features: [
      "Tam 24 haftalık program",
      "Lonca sistemi erişimi",
      "Mentor mesajlaşma",
      "Tüm yaşam alanları",
      "Haftalık görevler & sprint'ler",
      "İlerleme analitiği",
      "Topluluk sıralaması",
      "Kaynak kütüphanesi",
    ],
    cta: "Katıl",
    popular: true,
    icon: Shield,
    color: "#3B82F6",
    glow: "rgba(59,130,246,0.3)",
  },
  {
    key: "kilic",
    name: "Kılıç",
    price: "₺2,499",
    priceSuffix: "/ay",
    description: "Elite seviye. Bire bir mentorluk ile maksimum dönüşüm.",
    features: [
      "Çelik'teki her şey",
      "1:1 haftalık mentor görüşmesi",
      "Öncelikli destek",
      "Özel görevler & planlar",
      "VIP lonca erişimi",
      "Kişisel ilerleme raporu",
      "Öncelikli başvuru incelemesi",
      "Ömür boyu topluluk erişimi",
    ],
    cta: "Katıl",
    popular: false,
    icon: Swords,
    color: "#A855F7",
    glow: "rgba(168,85,247,0.3)",
  },
];

// ============================================
// Animation Variants
// ============================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

// ============================================
// Component
// ============================================

export default function Pricing() {
  const { user } = useAuth();
  const { plan: currentPlan } = useSubscription();
  const navigate = useNavigate();

  const handleCheckout = (tier: PricingTier) => {
    // Free tier goes to apply
    if (tier.price === "Ücretsiz") {
      navigate("/apply");
      return;
    }

    // If not logged in, redirect to login with return URL
    if (!user) {
      navigate(`/login?redirect=${encodeURIComponent("/pricing")}`);
      return;
    }

    // Build checkout URL with user email for webhook identification
    const baseUrl = CHECKOUT_URLS[tier.key];
    if (!baseUrl || baseUrl === "#") {
      console.warn("Checkout URL not configured for:", tier.key);
      return;
    }

    const separator = baseUrl.includes("?") ? "&" : "?";
    const checkoutUrl = `${baseUrl}${separator}checkout[custom][user_email]=${encodeURIComponent(user.email || "")}`;
    window.open(checkoutUrl, "_blank");
  };

  return (
    <div className="relative min-h-screen bg-[hsl(0,0%,4%)] overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full blur-[200px] bg-primary/[0.06]" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] rounded-full blur-[160px] bg-blue-500/[0.04]" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full blur-[140px] bg-purple-500/[0.03]" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-16 md:py-24">
        {/* Back link */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={16} />
            Ana Sayfa
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="w-16 h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent mx-auto mb-8"
          />
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl tracking-wider text-foreground mb-6">
            FİYATLANDIRMA
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground/60 max-w-2xl mx-auto">
            Dönüşüm yolculuğun için doğru planı seç. Her seviye seni ocağa bir adım daha yaklaştırır.
          </p>
        </motion.div>

        {/* Tier Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8"
        >
          {TIERS.map((tier) => {
            const Icon = tier.icon;

            return (
              <motion.div
                key={tier.name}
                variants={cardVariants}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="relative group"
              >
                {/* Popular badge */}
                {tier.popular && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="absolute -top-4 left-1/2 -translate-x-1/2 z-20"
                  >
                    <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary text-[hsl(0,0%,4%)] text-xs font-bold tracking-wider">
                      <Star size={12} fill="currentColor" />
                      ÖNERİLEN
                    </div>
                  </motion.div>
                )}

                {/* Ember glow border for popular */}
                {tier.popular && (
                  <motion.div
                    className="absolute -inset-[1px] rounded-2xl z-0"
                    style={{
                      background: `linear-gradient(135deg, hsl(16 100% 50% / 0.6), hsl(16 100% 50% / 0.2), hsl(30 100% 50% / 0.4), hsl(16 100% 50% / 0.2))`,
                      backgroundSize: '300% 300%',
                    }}
                    animate={{
                      backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  />
                )}

                {/* Hover glow */}
                <motion.div
                  className="absolute -inset-[1px] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"
                  style={{
                    background: `linear-gradient(135deg, ${tier.color}44, transparent, ${tier.color}22)`,
                    filter: 'blur(1px)',
                  }}
                />

                {/* Card content */}
                <div
                  className={`relative z-10 rounded-2xl border backdrop-blur-xl overflow-hidden ${
                    tier.popular
                      ? 'border-primary/30 bg-white/[0.05]'
                      : 'border-white/[0.06] bg-white/[0.03]'
                  }`}
                >
                  {/* Top accent line */}
                  <div
                    className="h-[2px] w-full"
                    style={{
                      background: tier.popular
                        ? `linear-gradient(90deg, transparent, hsl(16 100% 50%), hsl(30 100% 50%), hsl(16 100% 50%), transparent)`
                        : `linear-gradient(90deg, transparent, ${tier.color}, transparent)`,
                    }}
                  />

                  {/* Inner glow for popular */}
                  {tier.popular && (
                    <div
                      className="absolute top-0 left-0 right-0 h-32 opacity-10 pointer-events-none"
                      style={{ background: 'linear-gradient(180deg, hsl(16 100% 50%), transparent)' }}
                    />
                  )}

                  <div className="relative p-6 md:p-8">
                    {/* Icon + Name */}
                    <div className="flex items-center gap-3 mb-4">
                      <motion.div
                        className="h-12 w-12 rounded-xl flex items-center justify-center"
                        style={{
                          background: `linear-gradient(135deg, ${tier.color}22, ${tier.color}44)`,
                          border: `1px solid ${tier.color}44`,
                        }}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                      >
                        <Icon size={22} style={{ color: tier.color }} strokeWidth={1.5} />
                      </motion.div>
                      <h3 className="font-display text-2xl tracking-wider text-foreground">
                        {tier.name}
                      </h3>
                    </div>

                    {/* Price */}
                    <div className="mb-4">
                      <div className="flex items-baseline gap-1">
                        <span className="font-display text-4xl md:text-5xl tracking-wide text-foreground">
                          {tier.price}
                        </span>
                        {tier.priceSuffix && (
                          <span className="text-sm text-muted-foreground">
                            {tier.priceSuffix}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground mb-6">
                      {tier.description}
                    </p>

                    {/* Divider */}
                    <div
                      className="h-[1px] w-full mb-6 opacity-40"
                      style={{
                        background: `linear-gradient(90deg, transparent, ${tier.color}66, transparent)`,
                      }}
                    />

                    {/* Features */}
                    <ul className="space-y-3 mb-8">
                      {tier.features.map((feature, i) => (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 + i * 0.05, duration: 0.3 }}
                          className="flex items-start gap-3"
                        >
                          <div
                            className="h-5 w-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                            style={{
                              background: `${tier.color}18`,
                              border: `1px solid ${tier.color}30`,
                            }}
                          >
                            <Check size={11} style={{ color: tier.color }} strokeWidth={3} />
                          </div>
                          <span className="text-sm text-foreground/80">{feature}</span>
                        </motion.li>
                      ))}
                    </ul>

                    {/* CTA Button */}
                    {user && currentPlan === tier.key ? (
                      <div className="w-full py-4 rounded-xl font-display text-sm tracking-[0.2em] text-center bg-white/[0.06] border border-white/[0.15] text-muted-foreground cursor-default">
                        Mevcut Plan
                      </div>
                    ) : (
                      <motion.button
                        onClick={() => handleCheckout(tier)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full py-4 rounded-xl font-display text-sm tracking-[0.2em] transition-all duration-500 ${
                          tier.popular
                            ? 'bg-primary text-[hsl(0,0%,4%)] hover:shadow-[0_0_40px_hsl(16_100%_50%/0.3)]'
                            : 'bg-white/[0.06] border border-white/[0.1] text-foreground hover:bg-white/[0.1] hover:border-white/[0.15]'
                        }`}
                        style={
                          tier.popular
                            ? undefined
                            : { boxShadow: `0 0 0px ${tier.color}00` }
                        }
                        onMouseEnter={(e) => {
                          if (!tier.popular) {
                            (e.target as HTMLElement).style.boxShadow = `0 0 30px ${tier.glow}`;
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!tier.popular) {
                            (e.target as HTMLElement).style.boxShadow = `0 0 0px ${tier.color}00`;
                          }
                        }}
                      >
                        {tier.cta}
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="text-center mt-16 space-y-3"
        >
          <p className="text-sm text-muted-foreground/40">
            Tüm planlar anında başlar. İstediğin zaman iptal edebilirsin.
          </p>
          <p className="font-display text-primary/20 tracking-[0.5em] text-[10px] uppercase">
            Discipline Is Fire
          </p>
        </motion.div>
      </div>
    </div>
  );
}
