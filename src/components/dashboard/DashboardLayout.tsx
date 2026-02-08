import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  LayoutDashboard, CheckSquare, ListTodo, TrendingUp,
  MessageSquare, User, LogOut, Menu, Shield,
  Users, CreditCard, Flame, Compass, BookOpen,
  UsersRound, ClipboardList
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const studentLinks = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/check-in", label: "Check-in", icon: CheckSquare },
  { to: "/life-areas", label: "Yaşam Alanları", icon: Compass },
  { to: "/tasks", label: "Görevler", icon: ListTodo },
  { to: "/progress", label: "İlerleme", icon: TrendingUp },
  { to: "/resources", label: "Kaynaklar", icon: BookOpen },
  { to: "/community", label: "Topluluk", icon: UsersRound },
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

const DashboardLayout = () => {
  const { user, role, profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);

  const links = role === "admin" ? adminLinks : studentLinks;

  useEffect(() => {
    if (!user) return;
    supabase.from("messages").select("id", { count: "exact", head: true })
      .eq("receiver_id", user.id).eq("is_read", false)
      .then(({ count }) => setUnreadMessages(count || 0));

    // Realtime for unread count
    const channel = supabase.channel("unread_messages")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `receiver_id=eq.${user.id}` }, () => {
        setUnreadMessages(prev => prev + 1);
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "messages", filter: `receiver_id=eq.${user.id}` }, () => {
        // Re-fetch count on update (message marked as read)
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

  return (
    <div className="min-h-screen bg-background flex">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card border-r border-border/30 flex flex-col transition-transform duration-300",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="p-6 border-b border-border/30">
          <Link to="/" className="flex items-center gap-2">
            <Flame className="w-6 h-6 text-primary" />
            <span className="font-display text-xl text-foreground tracking-wider">THE FORGE</span>
          </Link>
          {role === "admin" && (
            <span className="mt-2 inline-flex items-center gap-1 text-xs text-primary bg-primary/10 px-2 py-1 rounded">
              <Shield className="w-3 h-3" /> Admin
            </span>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {links.map((link) => {
            const isActive = location.pathname === link.to || 
              (link.to !== "/dashboard" && link.to !== "/admin" && location.pathname.startsWith(link.to));
            const isMessages = link.to === "/messages" || link.to === "/admin/messages";
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative",
                  isActive
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
                {isMessages && unreadMessages > 0 && (
                  <span className="absolute right-3 bg-destructive text-destructive-foreground text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {unreadMessages > 9 ? "9+" : unreadMessages}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border/30">
          <div className="flex items-center gap-3 mb-3">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-bold">
                {profile?.full_name?.charAt(0)?.toUpperCase() || "U"}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground truncate">{profile?.full_name || "Kullanıcı"}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4 mr-2" /> Çıkış Yap
          </Button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-card/80 backdrop-blur border-b border-border/30 flex items-center px-4 lg:px-6 sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-foreground mr-4">
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="font-display text-lg text-foreground tracking-wide">
            {links.find(l => location.pathname === l.to || (l.to !== "/dashboard" && l.to !== "/admin" && location.pathname.startsWith(l.to)))?.label || "Dashboard"}
          </h1>
        </header>

        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
