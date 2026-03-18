import { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  LayoutDashboard, CheckSquare, ListTodo, TrendingUp,
  MessageSquare, User, LogOut, Menu, Shield,
  Users, CreditCard, Flame, Compass, BookOpen,
  UsersRound, ClipboardList, Swords, Trophy, Award, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import OnboardingModal from "@/components/OnboardingModal";
import ThemeToggle from "@/components/ThemeToggle";

// ─── Navigation Links ────────────────────────────────────────────────────────

const studentLinks = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/check-in", label: "Check-in", icon: CheckSquare },
  { to: "/life-areas", label: "Yaşam Alanları", icon: Compass },
  { to: "/tasks", label: "Görevler", icon: ListTodo },
  { to: "/progress", label: "İlerleme", icon: TrendingUp },
  { to: "/resources", label: "Kaynaklar", icon: BookOpen },
  { to: "/community", label: "Topluluk", icon: UsersRound },
  { to: "/guilds", label: "Loncalar", icon: Swords },
  { to: "/rankings", label: "Sıralama", icon: Trophy },
  { to: "/forged", label: "Forged Wall", icon: Award },
  { to: "/messages", label: "Mesajlar", icon: MessageSquare },
  { to: "/profile", label: "Profil", icon: User },
];

const adminLinks = [
  { to: "/admin", label: "Genel Bakış", icon: LayoutDashboard },
  { to: "/admin/applications", label: "Başvurular", icon: ClipboardList },
  { to: "/admin/students", label: "Öğrenciler", icon: Users },
  { to: "/admin/tasks", label: "Görevler", icon: ListTodo },
  { to: "/admin/messages", label: "Mesajlar", icon: MessageSquare },
  { to: "/admin/payments", label: "Ödemeler", icon: CreditCard },
];

// ─── Ember Particles (Subtle Background Effect) ─────────────────────────────

const EmberParticles = () => {
  const particles = useMemo(() =>
    Array.from({ length: 6 }, (_, i) => ({
      id: i,
      x: 15 + Math.random() * 70,
      delay: Math.random() * 8,
      duration: 6 + Math.random() * 6,
      size: 2 + Math.random() * 2,
      opacity: 0.15 + Math.random() * 0.2,
    })),
    []
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Subtle radial glow at top */}
      <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-40 h-40 bg-ember/[0.06] rounded-full blur-3xl" />
      {/* Subtle radial glow at bottom */}
      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-32 h-32 bg-ember/[0.04] rounded-full blur-3xl" />
      {/* Floating ember particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-ember"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            bottom: -10,
          }}
          animate={{
            y: [0, -600 - Math.random() * 300],
            x: [0, (Math.random() - 0.5) * 40],
            opacity: [0, p.opacity, p.opacity, 0],
            scale: [0.5, 1, 0.8, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
};

// ─── Nav Link Component ──────────────────────────────────────────────────────

interface NavLinkProps {
  to: string;
  label: string;
  icon: React.ElementType;
  isActive: boolean;
  unreadCount?: number;
  onClick?: () => void;
}

const NavLink = ({ to, label, icon: Icon, isActive, unreadCount, onClick }: NavLinkProps) => (
  <Link
    to={to}
    onClick={onClick}
    aria-current={isActive ? "page" : undefined}
    className="relative group block"
  >
    <div
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 relative",
        isActive
          ? "text-foreground"
          : "text-muted-foreground hover:text-foreground/80"
      )}
    >
      {/* Active indicator bar */}
      <div
        className={cn(
          "absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-full transition-all duration-300",
          isActive
            ? "h-5 bg-ember opacity-100 shadow-[0_0_8px_hsl(var(--ember)/0.5)]"
            : "h-0 bg-ember opacity-0 group-hover:h-3 group-hover:opacity-40"
        )}
      />

      {/* Icon */}
      <Icon
        className={cn(
          "w-[18px] h-[18px] transition-colors duration-200 flex-shrink-0",
          isActive ? "text-ember" : "text-muted-foreground group-hover:text-foreground/70"
        )}
      />

      {/* Label */}
      <span className="truncate">{label}</span>

      {/* Unread badge */}
      {unreadCount !== undefined && unreadCount > 0 && (
        <span className="ml-auto relative flex items-center justify-center">
          <span className="absolute inset-0 rounded-full bg-ember/40 animate-ping" />
          <span className="relative bg-ember text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        </span>
      )}
    </div>
  </Link>
);

// ─── Main Layout ─────────────────────────────────────────────────────────────

const DashboardLayout = () => {
  const { user, role, profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);

  const links = role === "admin" ? adminLinks : studentLinks;

  // ── Unread messages (realtime) ──
  useEffect(() => {
    if (!user) return;
    supabase.from("messages").select("id", { count: "exact", head: true })
      .eq("receiver_id", user.id).eq("is_read", false)
      .then(({ count }) => setUnreadMessages(count || 0));

    const channel = supabase.channel("unread_messages")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `receiver_id=eq.${user.id}` }, () => {
        setUnreadMessages(prev => prev + 1);
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "messages", filter: `receiver_id=eq.${user.id}` }, () => {
        supabase.from("messages").select("id", { count: "exact", head: true })
          .eq("receiver_id", user.id).eq("is_read", false)
          .then(({ count }) => setUnreadMessages(count || 0));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  const currentPageLabel = useMemo(() => {
    return links.find(l =>
      location.pathname === l.to ||
      (l.to !== "/dashboard" && l.to !== "/admin" && location.pathname.startsWith(l.to))
    )?.label || "Dashboard";
  }, [links, location.pathname]);

  // ── Sidebar Content (shared between mobile & desktop) ──
  const sidebarContent = (
    <>
      {/* Ember particles background */}
      <EmberParticles />

      {/* Logo section */}
      <div className="relative z-10 px-5 pt-6 pb-4">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="relative">
            <Flame className="w-6 h-6 text-ember transition-transform duration-300 group-hover:scale-110" />
            {/* Ember glow behind flame */}
            <div className="absolute inset-0 w-6 h-6 bg-ember/30 rounded-full blur-md animate-pulse" />
          </div>
          <span className="font-display text-xl text-foreground tracking-[0.15em] select-none">
            THE FORGE
          </span>
        </Link>
        {role === "admin" && (
          <motion.span
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 inline-flex items-center gap-1.5 text-[11px] text-ember bg-ember/10 border border-ember/20 px-2.5 py-1 rounded-md font-medium tracking-wide"
          >
            <Shield className="w-3 h-3" /> ADMIN
          </motion.span>
        )}
      </div>

      {/* Divider */}
      <div className="mx-5 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      {/* Navigation */}
      <nav aria-label="Ana navigasyon" className="relative z-10 flex-1 px-3 py-3 space-y-0.5 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {links.map((link) => {
          const isActive = location.pathname === link.to ||
            (link.to !== "/dashboard" && link.to !== "/admin" && location.pathname.startsWith(link.to));
          const isMessages = link.to === "/messages" || link.to === "/admin/messages";
          return (
            <NavLink
              key={link.to}
              to={link.to}
              label={link.label}
              icon={link.icon}
              isActive={isActive}
              unreadCount={isMessages ? unreadMessages : undefined}
              onClick={closeSidebar}
            />
          );
        })}
      </nav>

      {/* Divider */}
      <div className="mx-5 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      {/* User profile section */}
      <div className="relative z-10 p-4">
        <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt=""
                className="w-9 h-9 rounded-lg object-cover ring-1 ring-white/10"
              />
            ) : (
              <div className="w-9 h-9 rounded-lg bg-ember/15 border border-ember/20 flex items-center justify-center text-ember text-sm font-bold">
                {profile?.full_name?.charAt(0)?.toUpperCase() || "U"}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground font-medium truncate leading-tight">
                {profile?.full_name || "Kullanıcı"}
              </p>
              <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                {user?.email}
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground hover:text-red-400 hover:bg-red-500/10 mt-2.5 h-8 text-xs rounded-lg transition-colors duration-200"
            onClick={handleSignOut}
          >
            <LogOut className="w-3.5 h-3.5 mr-2" /> Çıkış Yap
          </Button>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* ── Mobile Overlay ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={closeSidebar}
          />
        )}
      </AnimatePresence>

      {/* ── Desktop Sidebar ── */}
      <aside className="hidden lg:flex w-64 flex-col fixed inset-y-0 left-0 z-50 bg-black/40 backdrop-blur-xl border-r border-white/[0.06]">
        {sidebarContent}
      </aside>

      {/* ── Mobile Sidebar ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 left-0 z-50 w-72 flex flex-col bg-black/60 backdrop-blur-xl border-r border-white/[0.06] lg:hidden"
          >
            {/* Close button */}
            <button
              onClick={closeSidebar}
              className="absolute top-5 right-4 z-20 text-muted-foreground hover:text-foreground transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>
            {sidebarContent}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── Main Content Area ── */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Header */}
        <header role="banner" className="h-14 bg-background/60 backdrop-blur-xl border-b border-white/[0.06] flex items-center px-4 lg:px-6 sticky top-0 z-30">
          <button
            aria-label="Menuyu ac"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-muted-foreground hover:text-foreground transition-colors mr-4 p-1 -ml-1"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="font-display text-lg text-foreground tracking-wide">
            {currentPageLabel}
          </h1>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </header>

        {/* Onboarding Modal (first login only) */}
        <OnboardingModal />

        {/* Page Content with Transitions */}
        <main role="main" className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
