import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings, Users, Target, Swords, Coins, ScrollText,
  AlertTriangle, ChevronDown, ChevronRight, Crown, Shield,
  Hammer, Flame, Circle, UserX, UserCheck, UserMinus,
  Plus, Trash2, Edit3, Calendar, Award, Search,
  ArrowUpDown, Save, X, Check, Lock, RefreshCw,
  Zap, TrendingUp, ShieldCheck, Ban, Gift, Eye,
  Sparkles, Clock, DollarSign, FileText, AlertCircle,
  Loader2,
} from "lucide-react";
import {
  type Guild,
  type GuildMember,
  type GuildQuest,
  type GuildChallenge,
  type GuildRole,
  type GuildType,
  type QuestType,
  type QuestStatus,
  type ChallengeType,
  type ChallengeStatus,
  type GuildRule,
  GUILD_ROLE_LABELS,
  GUILD_ROLE_COLORS,
  GUILD_ROLE_ORDER,
  TIER_CONFIG,
  LEVEL_CONFIG,
} from "@/types/guild";
import RoleBadge from "@/components/guild/RoleBadge";
import TierBadge from "@/components/guild/TierBadge";
import HeatMeter from "@/components/guild/HeatMeter";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

// ============================================
// Mock Data (kept for Vault & Challenges — separate sprint)
// ============================================

const VAULT_ITEMS = [
  { id: "v1", name: "Arma Yenileme", description: "Guild amblemini güncelle", cost: 300, icon: RefreshCw, color: "#00BFFF" },
  { id: "v2", name: "Heat Boost", description: "24 saat %50 ekstra heat", cost: 200, icon: Flame, color: "#FF8C00" },
  { id: "v3", name: "Shield", description: "1 hafta tier düşüş koruması", cost: 500, icon: ShieldCheck, color: "#C0C0C0" },
  { id: "v4", name: "Spotlight", description: "Guild keşfet listesinde öne çıkar", cost: 400, icon: Sparkles, color: "#FFD700" },
  { id: "v5", name: "Kapasite Artışı", description: "+5 üye kapasitesi", cost: 600, icon: Users, color: "#9333EA" },
  { id: "v6", name: "XP Boost", description: "48 saat %25 ekstra XP", cost: 350, icon: TrendingUp, color: "#22C55E" },
];

const SPENDING_HISTORY = [
  { id: "s1", item: "Heat Boost", cost: 200, date: "2026-03-10T10:00:00Z", by: "Kaan Yılmaz" },
  { id: "s2", item: "Shield", cost: 500, date: "2026-02-20T10:00:00Z", by: "Elif Demir" },
  { id: "s3", item: "Spotlight", cost: 400, date: "2026-02-05T10:00:00Z", by: "Kaan Yılmaz" },
];

const MOCK_CHALLENGES: GuildChallenge[] = [];

// ============================================
// Section Config
// ============================================

type SectionKey = "settings" | "members" | "quests" | "challenges" | "vault" | "rules" | "danger";

interface SectionConfig {
  key: SectionKey;
  label: string;
  icon: React.ElementType;
  color: string;
}

const SECTIONS: SectionConfig[] = [
  { key: "settings", label: "Guild Ayarları", icon: Settings, color: "#FF8C00" },
  { key: "members", label: "Üye Yönetimi", icon: Users, color: "#00BFFF" },
  { key: "quests", label: "Quest Yönetimi", icon: Target, color: "#22C55E" },
  { key: "challenges", label: "Challenge", icon: Swords, color: "#FF4500" },
  { key: "vault", label: "Hazine", icon: Coins, color: "#FFD700" },
  { key: "rules", label: "Kurallar", icon: ScrollText, color: "#C0C0C0" },
  { key: "danger", label: "Tehlikeli Bölge", icon: AlertTriangle, color: "#EF4444" },
];

// ============================================
// Helpers
// ============================================

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" });
}

const ROLE_LIST: GuildRole[] = ["blacksmith", "striker", "tempered", "heated", "raw"];

const QUEST_TYPE_LABELS: Record<QuestType, string> = {
  weekly: "Haftalık",
  challenge: "Challenge",
  brotherhood: "Brotherhood",
  external: "Harici",
  sprint: "Sprint",
};

const CHALLENGE_TYPE_LABELS: Record<ChallengeType, string> = {
  spark_duel: "Spark Duel",
  heat_wave: "Heat Wave",
  iron_week: "Iron Week",
  blacksmith_bet: "Blacksmith Bet",
};

const CHALLENGE_STATUS_LABELS: Record<ChallengeStatus, { label: string; color: string }> = {
  pending: { label: "Beklemede", color: "#FFD700" },
  accepted: { label: "Kabul Edildi", color: "#22C55E" },
  rejected: { label: "Reddedildi", color: "#EF4444" },
  live: { label: "Canlı", color: "#FF4500" },
  completed: { label: "Tamamlandı", color: "#C0C0C0" },
};

// ============================================
// Glassmorphism Card Wrapper
// ============================================

function GlassCard({
  children,
  className = "",
  accentColor,
}: {
  children: React.ReactNode;
  className?: string;
  accentColor?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`relative rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl overflow-hidden ${className}`}
    >
      {accentColor && (
        <div
          className="h-[2px] w-full"
          style={{ background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }}
        />
      )}
      {children}
    </motion.div>
  );
}

function GlassInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  textarea = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  textarea?: boolean;
}) {
  const cls =
    "w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none transition-all focus:border-ember/30 focus:bg-white/[0.06] focus:shadow-[0_0_20px_rgba(255,69,0,0.08)] backdrop-blur-sm";
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</label>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className={cls + " resize-none"}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cls}
        />
      )}
    </div>
  );
}

function GlassSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-foreground outline-none transition-all focus:border-ember/30 focus:bg-white/[0.06] appearance-none backdrop-blur-sm cursor-pointer"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-black text-white">
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// ============================================
// Loading Spinner
// ============================================

function LoadingSpinner({ text = "Yükleniyor..." }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <Loader2 className="w-8 h-8 text-ember animate-spin" />
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

// ============================================
// Confirmation Dialog
// ============================================

function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel,
  danger = false,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel: string;
  danger?: boolean;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl border border-white/[0.08] bg-black/90 backdrop-blur-2xl p-6 mx-4"
          >
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl mb-4 ${danger ? "bg-red-500/10 border border-red-500/20" : "bg-ember/10 border border-ember/20"}`}>
              <AlertCircle size={24} className={danger ? "text-red-400" : "text-ember"} />
            </div>
            <h3 className="font-display text-lg tracking-wide text-foreground mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground mb-6">{message}</p>
            <div className="flex gap-3 justify-end">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-white/[0.08] transition-colors"
              >
                İptal
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { onConfirm(); onClose(); }}
                className={`rounded-xl px-4 py-2 text-sm font-medium text-white transition-colors ${danger ? "bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/20" : "bg-ember hover:bg-ember/90 shadow-lg shadow-ember/20"}`}
              >
                {confirmLabel}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============================================
// Section Components
// ============================================

function SettingsSection({ guild, onSaved }: { guild: Guild; onSaved: () => void }) {
  const [name, setName] = useState(guild.name);
  const [motto, setMotto] = useState(guild.motto || "");
  const [description, setDescription] = useState(guild.description || "");
  const [guildType, setGuildType] = useState<string>(guild.guild_type);
  const [minStreak, setMinStreak] = useState(String(guild.min_streak_requirement));
  const [minPhase, setMinPhase] = useState(String(guild.min_phase_requirement));
  const [minScore, setMinScore] = useState(String(guild.min_score_requirement));
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("guilds")
        .update({
          name,
          motto: motto || null,
          description: description || null,
          guild_type: guildType as GuildType,
          min_streak_requirement: parseInt(minStreak) || 0,
          min_phase_requirement: parseInt(minPhase) || 0,
          min_score_requirement: parseInt(minScore) || 0,
          updated_at: new Date().toISOString(),
        })
        .eq("id", guild.id);

      if (error) throw error;
      toast.success("Guild ayarları kaydedildi!");
      onSaved();
    } catch (err: any) {
      toast.error(err.message || "Kaydetme başarısız oldu.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <GlassCard accentColor="#FF8C00">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF8C00]/10 border border-[#FF8C00]/20">
            <Settings size={18} className="text-[#FF8C00]" />
          </div>
          <div>
            <h3 className="font-display text-base tracking-wide text-foreground">Guild Ayarları</h3>
            <p className="text-xs text-muted-foreground">Lonca bilgilerini düzenle</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <GlassInput label="Guild Adı" value={name} onChange={setName} placeholder="Guild adı" />
          <GlassInput label="Motto" value={motto} onChange={setMotto} placeholder="Kısa slogan" />
          <div className="md:col-span-2">
            <GlassInput label="Açıklama" value={description} onChange={setDescription} textarea placeholder="Guild hakkında detaylı bilgi" />
          </div>
          <GlassSelect
            label="Guild Tipi"
            value={guildType}
            onChange={setGuildType}
            options={[
              { value: "open", label: "Açık — Herkes katılabilir" },
              { value: "application", label: "Başvuru — Onay gerekli" },
              { value: "invite", label: "Davetli — Sadece davet ile" },
            ]}
          />
          <GlassInput label="Min. Streak" value={minStreak} onChange={setMinStreak} type="number" />
          <GlassInput label="Min. Phase" value={minPhase} onChange={setMinPhase} type="number" />
          <GlassInput label="Min. Skor" value={minScore} onChange={setMinScore} type="number" />
        </div>
        <div className="mt-6 flex justify-end">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-ember px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-ember/20 hover:bg-ember/90 transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </motion.button>
        </div>
      </div>
    </GlassCard>
  );
}

function MembersSection({ guild }: { guild: Guild }) {
  const [members, setMembers] = useState<GuildMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [kickTarget, setKickTarget] = useState<{ id: string; name: string } | null>(null);
  const [roleDropdown, setRoleDropdown] = useState<string | null>(null);
  const [showApplications, setShowApplications] = useState(false);

  const fetchMembers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("guild_members")
        .select("*, profiles(full_name, avatar_url, streak, current_phase, current_week)")
        .eq("guild_id", guild.id)
        .eq("is_active", true)
        .order("contribution_points", { ascending: false });

      if (error) throw error;

      const mapped: GuildMember[] = (data || []).map((row: any) => ({
        id: row.id,
        guild_id: row.guild_id,
        user_id: row.user_id,
        role: row.role,
        joined_at: row.joined_at,
        promoted_at: row.promoted_at,
        contribution_points: row.contribution_points || 0,
        is_active: row.is_active,
        profile: row.profiles ? {
          full_name: row.profiles.full_name || "İsimsiz",
          avatar_url: row.profiles.avatar_url,
          streak: row.profiles.streak || 0,
          current_phase: row.profiles.current_phase || 1,
          current_week: row.profiles.current_week || 1,
        } : undefined,
      }));

      setMembers(mapped);
    } catch (err: any) {
      toast.error("Üyeler yüklenemedi: " + (err.message || "Bilinmeyen hata"));
    } finally {
      setLoading(false);
    }
  }, [guild.id]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleRoleChange = async (memberId: string, newRole: GuildRole) => {
    try {
      const { error } = await supabase
        .from("guild_members")
        .update({ role: newRole, promoted_at: new Date().toISOString() })
        .eq("id", memberId);

      if (error) throw error;
      toast.success("Rol güncellendi!");
      setRoleDropdown(null);
      fetchMembers();
    } catch (err: any) {
      toast.error("Rol değiştirilemedi: " + (err.message || ""));
    }
  };

  const handleKick = async () => {
    if (!kickTarget) return;
    try {
      const { error } = await supabase
        .from("guild_members")
        .update({ is_active: false })
        .eq("id", kickTarget.id);

      if (error) throw error;
      toast.success(`${kickTarget.name} loncadan çıkarıldı.`);
      setKickTarget(null);
      fetchMembers();
    } catch (err: any) {
      toast.error("Üye çıkarılamadı: " + (err.message || ""));
    }
  };

  const sorted = [...members].sort(
    (a, b) => GUILD_ROLE_ORDER[b.role] - GUILD_ROLE_ORDER[a.role]
  );

  if (loading) return <LoadingSpinner text="Üyeler yükleniyor..." />;

  return (
    <>
      <GlassCard accentColor="#00BFFF">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00BFFF]/10 border border-[#00BFFF]/20">
                <Users size={18} className="text-[#00BFFF]" />
              </div>
              <div>
                <h3 className="font-display text-base tracking-wide text-foreground">Üye Yönetimi</h3>
                <p className="text-xs text-muted-foreground">{members.length} aktif üye</p>
              </div>
            </div>
          </div>

          {/* Member list */}
          <div className="space-y-1">
            {sorted.map((member, i) => {
              const roleColor = GUILD_ROLE_COLORS[member.role];
              const isFounder = member.user_id === guild.founder_id;
              return (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.03 }}
                  className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-white/[0.03]"
                >
                  {/* Avatar */}
                  <Avatar className="h-9 w-9 border border-white/[0.08] shrink-0">
                    {member.profile?.avatar_url && (
                      <AvatarImage src={member.profile.avatar_url} />
                    )}
                    <AvatarFallback
                      className="text-[11px] font-bold"
                      style={{
                        background: `linear-gradient(135deg, ${roleColor}33, ${roleColor}11)`,
                        color: roleColor,
                      }}
                    >
                      {getInitials(member.profile?.full_name || "?")}
                    </AvatarFallback>
                  </Avatar>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground truncate">
                        {member.profile?.full_name}
                      </span>
                      {isFounder && (
                        <Crown size={12} className="text-amber-400 shrink-0" />
                      )}
                      <RoleBadge role={member.role} size="sm" />
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Streak: {member.profile?.streak} &middot; Phase {member.profile?.current_phase} W{member.profile?.current_week} &middot; {member.contribution_points.toLocaleString()} CP
                    </p>
                  </div>

                  {/* Joined */}
                  <span className="hidden text-[10px] text-muted-foreground/40 sm:block shrink-0">
                    {formatDate(member.joined_at)}
                  </span>

                  {/* Actions */}
                  {!isFounder && (
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      {/* Role change */}
                      <div className="relative">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setRoleDropdown(roleDropdown === member.id ? null : member.id)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.06] text-muted-foreground hover:bg-white/[0.1] transition-colors"
                        >
                          <ArrowUpDown size={13} />
                        </motion.button>
                        <AnimatePresence>
                          {roleDropdown === member.id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95, y: -4 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: -4 }}
                              className="absolute right-0 top-full z-20 mt-1 w-40 rounded-xl border border-white/[0.08] bg-black/95 backdrop-blur-xl p-1.5 shadow-2xl"
                            >
                              {ROLE_LIST.filter((r) => r !== "blacksmith").map((r) => (
                                <button
                                  key={r}
                                  onClick={() => handleRoleChange(member.id, r)}
                                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs transition-colors ${
                                    r === member.role ? "bg-white/[0.08] text-foreground" : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"
                                  }`}
                                >
                                  <span className="h-2 w-2 rounded-full" style={{ background: GUILD_ROLE_COLORS[r] }} />
                                  {GUILD_ROLE_LABELS[r]}
                                  {r === member.role && <Check size={12} className="ml-auto text-ember" />}
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      {/* Kick */}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setKickTarget({ id: member.id, name: member.profile?.full_name || "" })}
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                      >
                        <UserMinus size={13} />
                      </motion.button>
                    </div>
                  )}
                </motion.div>
              );
            })}

            {members.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-8">Henüz üye bulunamadı.</p>
            )}
          </div>
        </div>
      </GlassCard>

      <ConfirmDialog
        open={!!kickTarget}
        onClose={() => setKickTarget(null)}
        onConfirm={handleKick}
        title="Üyeyi Çıkar"
        message={`${kickTarget?.name} adlı üyeyi loncadan çıkarmak istediğine emin misin? Bu işlem geri alınamaz.`}
        confirmLabel="Çıkar"
        danger
      />
    </>
  );
}

function QuestsSection({ guild }: { guild: Guild }) {
  const { user } = useAuth();
  const [quests, setQuests] = useState<GuildQuest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newType, setNewType] = useState<string>("weekly");
  const [newTarget, setNewTarget] = useState("");
  const [newPoints, setNewPoints] = useState("");
  const [newStart, setNewStart] = useState("");
  const [newEnd, setNewEnd] = useState("");

  const fetchQuests = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("guild_quests")
        .select("*")
        .eq("guild_id", guild.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setQuests(((data || []) as unknown) as GuildQuest[]);
    } catch (err: any) {
      toast.error("Quest'ler yüklenemedi: " + (err.message || ""));
    } finally {
      setLoading(false);
    }
  }, [guild.id]);

  useEffect(() => {
    fetchQuests();
  }, [fetchQuests]);

  const handleCreate = async () => {
    if (!newTitle.trim() || !newTarget || !newPoints || !newStart || !newEnd) {
      toast.error("Lütfen tüm alanları doldurun.");
      return;
    }
    setCreating(true);
    try {
      const { error } = await supabase.from("guild_quests").insert({
        guild_id: guild.id,
        created_by: user?.id,
        title: newTitle.trim(),
        description: newDesc.trim() || null,
        quest_type: newType as QuestType,
        target_value: parseInt(newTarget),
        current_value: 0,
        points_reward: parseInt(newPoints),
        starts_at: new Date(newStart).toISOString(),
        ends_at: new Date(newEnd).toISOString(),
        status: "active",
        completion_rate: 0,
      });

      if (error) throw error;
      toast.success("Quest oluşturuldu!");
      setNewTitle(""); setNewDesc(""); setNewTarget(""); setNewPoints(""); setNewStart(""); setNewEnd("");
      setShowCreate(false);
      fetchQuests();
    } catch (err: any) {
      toast.error("Quest oluşturulamadı: " + (err.message || ""));
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <LoadingSpinner text="Quest'ler yükleniyor..." />;

  return (
    <GlassCard accentColor="#22C55E">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/20">
              <Target size={18} className="text-[#22C55E]" />
            </div>
            <div>
              <h3 className="font-display text-base tracking-wide text-foreground">Quest Yönetimi</h3>
              <p className="text-xs text-muted-foreground">{quests.filter((q) => q.status === "active").length} aktif quest</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowCreate(!showCreate)}
            className="flex items-center gap-2 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/20 px-4 py-2 text-sm font-medium text-[#22C55E] hover:bg-[#22C55E]/20 transition-colors"
          >
            <Plus size={15} />
            Yeni Quest
          </motion.button>
        </div>

        {/* Create form */}
        <AnimatePresence>
          {showCreate && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden mb-6"
            >
              <div className="rounded-xl border border-[#22C55E]/10 bg-[#22C55E]/[0.03] p-5 space-y-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-[#22C55E]/60">
                  Yeni Quest Oluştur
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                  <GlassInput label="Başlık" value={newTitle} onChange={setNewTitle} placeholder="Quest başlığı" />
                  <GlassSelect
                    label="Tür"
                    value={newType}
                    onChange={setNewType}
                    options={Object.entries(QUEST_TYPE_LABELS).map(([v, l]) => ({ value: v, label: l }))}
                  />
                  <div className="md:col-span-2">
                    <GlassInput label="Açıklama" value={newDesc} onChange={setNewDesc} textarea placeholder="Quest detayları" />
                  </div>
                  <GlassInput label="Hedef Değer" value={newTarget} onChange={setNewTarget} type="number" placeholder="Örn: 38" />
                  <GlassInput label="Ödül Puanı" value={newPoints} onChange={setNewPoints} type="number" placeholder="Örn: 200" />
                  <GlassInput label="Başlangıç" value={newStart} onChange={setNewStart} type="date" />
                  <GlassInput label="Bitiş" value={newEnd} onChange={setNewEnd} type="date" />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowCreate(false)}
                    className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-white/[0.08] transition-colors"
                  >
                    İptal
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCreate}
                    disabled={creating}
                    className="flex items-center gap-2 rounded-xl bg-[#22C55E] px-5 py-2 text-sm font-medium text-white shadow-lg shadow-[#22C55E]/20 hover:bg-[#22C55E]/90 transition-colors disabled:opacity-50"
                  >
                    {creating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                    {creating ? "Oluşturuluyor..." : "Oluştur"}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quest list */}
        <div className="space-y-3">
          {quests.map((quest, i) => {
            const isActive = quest.status === "active";
            const isCompleted = quest.status === "completed";
            return (
              <motion.div
                key={quest.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-medium text-foreground">{quest.title}</h4>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-medium border ${
                          isCompleted
                            ? "bg-green-500/10 text-green-400 border-green-500/20"
                            : isActive
                            ? "bg-ember/10 text-ember border-ember/20"
                            : "bg-white/[0.06] text-muted-foreground border-white/[0.08]"
                        }`}
                      >
                        {isCompleted ? "Tamamlandı" : isActive ? "Aktif" : quest.status}
                      </span>
                      <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] text-muted-foreground border border-white/[0.06]">
                        {QUEST_TYPE_LABELS[quest.quest_type]}
                      </span>
                    </div>
                    {quest.description && (
                      <p className="text-[11px] text-muted-foreground">{quest.description}</p>
                    )}
                  </div>
                  {isActive && (
                    <div className="flex gap-1.5 shrink-0 ml-3">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.06] text-muted-foreground hover:bg-white/[0.1] transition-colors"
                      >
                        <Edit3 size={13} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                      >
                        <X size={13} />
                      </motion.button>
                    </div>
                  )}
                </div>
                {/* Progress bar */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${quest.completion_rate}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{
                        background: isCompleted
                          ? "linear-gradient(90deg, #22C55E, #16A34A)"
                          : "linear-gradient(90deg, hsl(var(--ember)), hsl(var(--ember-dark)))",
                      }}
                    />
                  </div>
                  <span className="text-[11px] text-muted-foreground shrink-0">
                    {quest.current_value}/{quest.target_value} ({Math.round(quest.completion_rate)}%)
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-amber-400 shrink-0">
                    <Award size={11} />
                    {quest.points_reward}
                  </span>
                </div>
                <p className="mt-2 text-[10px] text-muted-foreground/50">
                  {formatDate(quest.starts_at)} — {formatDate(quest.ends_at)}
                </p>
              </motion.div>
            );
          })}

          {quests.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-8">Henüz quest bulunamadı.</p>
          )}
        </div>
      </div>
    </GlassCard>
  );
}

function ChallengesSection({ guild }: { guild: Guild }) {
  const [searchGuild, setSearchGuild] = useState("");
  const [challengeType, setChallengeType] = useState<string>("spark_duel");

  return (
    <GlassCard accentColor="#FF4500">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF4500]/10 border border-[#FF4500]/20">
            <Swords size={18} className="text-[#FF4500]" />
          </div>
          <div>
            <h3 className="font-display text-base tracking-wide text-foreground">Challenge Yönetimi</h3>
            <p className="text-xs text-muted-foreground">Guild'ler arası meydan okuma</p>
          </div>
        </div>

        {/* Send challenge */}
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 mb-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60 mb-3">
            Challenge Gönder
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Guild Ara</label>
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
                <input
                  type="text"
                  value={searchGuild}
                  onChange={(e) => setSearchGuild(e.target.value)}
                  placeholder="Guild adı yazın..."
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none transition-all focus:border-ember/30 focus:bg-white/[0.06] backdrop-blur-sm"
                />
              </div>
            </div>
            <GlassSelect
              label="Challenge Türü"
              value={challengeType}
              onChange={setChallengeType}
              options={Object.entries(CHALLENGE_TYPE_LABELS).map(([v, l]) => ({ value: v, label: l }))}
            />
          </div>
          <div className="mt-4 flex justify-end">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 rounded-xl bg-[#FF4500] px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-[#FF4500]/20 hover:bg-[#FF4500]/90 transition-colors"
            >
              <Swords size={15} />
              Challenge Gönder
            </motion.button>
          </div>
        </div>

        {/* Empty state for challenges */}
        <div className="text-center py-8">
          <Swords size={32} className="mx-auto text-muted-foreground/20 mb-3" />
          <p className="text-sm text-muted-foreground">Challenge sistemi yakında aktif olacak.</p>
        </div>
      </div>
    </GlassCard>
  );
}

function VaultSection({ guild }: { guild: Guild }) {
  const [confirmPurchase, setConfirmPurchase] = useState<string | null>(null);
  const purchaseItem = VAULT_ITEMS.find((v) => v.id === confirmPurchase);

  return (
    <>
      <GlassCard accentColor="#FFD700">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFD700]/10 border border-[#FFD700]/20">
                <Coins size={18} className="text-[#FFD700]" />
              </div>
              <div>
                <h3 className="font-display text-base tracking-wide text-foreground">Hazine</h3>
                <p className="text-xs text-muted-foreground">Guild treasury yönetimi</p>
              </div>
            </div>
            {/* Balance */}
            <div className="flex items-center gap-2 rounded-xl bg-[#FFD700]/10 border border-[#FFD700]/20 px-4 py-2">
              <Coins size={16} className="text-[#FFD700]" />
              <span className="font-display text-lg text-[#FFD700]">{guild.treasury_points.toLocaleString()}</span>
              <span className="text-xs text-[#FFD700]/60">TP</span>
            </div>
          </div>

          {/* Spending options grid */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-6">
            {VAULT_ITEMS.map((item, i) => {
              const Icon = item.icon;
              const canAfford = guild.treasury_points >= item.cost;
              return (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  whileHover={canAfford ? { y: -2, transition: { duration: 0.2 } } : undefined}
                  whileTap={canAfford ? { scale: 0.98 } : undefined}
                  onClick={() => canAfford && setConfirmPurchase(item.id)}
                  disabled={!canAfford}
                  className={`relative rounded-xl border p-4 text-left transition-all overflow-hidden ${
                    canAfford
                      ? "border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] cursor-pointer"
                      : "border-white/[0.04] bg-white/[0.01] opacity-50 cursor-not-allowed"
                  }`}
                >
                  {/* Accent top */}
                  <div className="h-[1px] absolute top-0 left-0 right-0" style={{ background: `linear-gradient(90deg, transparent, ${item.color}44, transparent)` }} />
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-lg"
                      style={{
                        background: `linear-gradient(135deg, ${item.color}15, ${item.color}05)`,
                        border: `1px solid ${item.color}33`,
                      }}
                    >
                      <Icon size={16} style={{ color: item.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{item.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Coins size={12} className="text-[#FFD700]" />
                    <span className="text-sm font-display text-[#FFD700]">{item.cost}</span>
                    <span className="text-[10px] text-muted-foreground">TP</span>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Spending history */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60 mb-3">
              Harcama Geçmişi
            </p>
            <div className="space-y-2">
              {SPENDING_HISTORY.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between rounded-lg px-3 py-2 bg-white/[0.02]"
                >
                  <div className="flex items-center gap-3">
                    <DollarSign size={14} className="text-muted-foreground/40" />
                    <div>
                      <p className="text-sm text-foreground">{s.item}</p>
                      <p className="text-[10px] text-muted-foreground">{s.by} &middot; {formatDate(s.date)}</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-red-400">-{s.cost} TP</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </GlassCard>

      <ConfirmDialog
        open={!!confirmPurchase}
        onClose={() => setConfirmPurchase(null)}
        onConfirm={() => setConfirmPurchase(null)}
        title="Satın Almayı Onayla"
        message={purchaseItem ? `"${purchaseItem.name}" için ${purchaseItem.cost} Treasury Point harcanacak. Onaylıyor musun?` : ""}
        confirmLabel="Satın Al"
      />
    </>
  );
}

function RulesSection({ guild, onSaved }: { guild: Guild; onSaved: () => void }) {
  const [rules, setRules] = useState<GuildRule[]>(guild.rules || []);
  const [newRule, setNewRule] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [saving, setSaving] = useState(false);

  const saveRules = async (updatedRules: GuildRule[]) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("guilds")
        .update({ rules: updatedRules as any, updated_at: new Date().toISOString() })
        .eq("id", guild.id);

      if (error) throw error;
      setRules(updatedRules);
      onSaved();
    } catch (err: any) {
      toast.error("Kurallar kaydedilemedi: " + (err.message || ""));
    } finally {
      setSaving(false);
    }
  };

  const addRule = () => {
    if (!newRule.trim()) return;
    const updatedRules = [...rules, { id: `r-${Date.now()}`, text: newRule.trim(), created_at: new Date().toISOString() }];
    saveRules(updatedRules);
    setNewRule("");
  };

  const startEdit = (rule: GuildRule) => {
    setEditingId(rule.id);
    setEditText(rule.text);
  };

  const saveEdit = () => {
    const updatedRules = rules.map((r) => (r.id === editingId ? { ...r, text: editText } : r));
    saveRules(updatedRules);
    setEditingId(null);
    setEditText("");
  };

  const deleteRule = (id: string) => {
    const updatedRules = rules.filter((r) => r.id !== id);
    saveRules(updatedRules);
  };

  return (
    <GlassCard accentColor="#C0C0C0">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#C0C0C0]/10 border border-[#C0C0C0]/20">
            <ScrollText size={18} className="text-[#C0C0C0]" />
          </div>
          <div>
            <h3 className="font-display text-base tracking-wide text-foreground">Guild Kuralları</h3>
            <p className="text-xs text-muted-foreground">{rules.length} kural tanımlı</p>
          </div>
        </div>

        {/* Rules list */}
        <div className="space-y-2 mb-4">
          {rules.map((rule, i) => (
            <motion.div
              key={rule.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: i * 0.03 }}
              className="group flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-[10px] font-bold text-muted-foreground mt-0.5">
                {i + 1}
              </span>
              {editingId === rule.id ? (
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                    className="flex-1 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-sm text-foreground outline-none focus:border-ember/30"
                    autoFocus
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={saveEdit}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20"
                  >
                    <Check size={14} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setEditingId(null)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.06] text-muted-foreground hover:bg-white/[0.1]"
                  >
                    <X size={14} />
                  </motion.button>
                </div>
              ) : (
                <>
                  <p className="flex-1 text-sm text-foreground/80 leading-relaxed">{rule.text}</p>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => startEdit(rule)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.06] text-muted-foreground hover:bg-white/[0.1]"
                    >
                      <Edit3 size={12} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => deleteRule(rule.id)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20"
                    >
                      <Trash2 size={12} />
                    </motion.button>
                  </div>
                </>
              )}
            </motion.div>
          ))}
        </div>

        {/* Add new rule */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newRule}
            onChange={(e) => setNewRule(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addRule()}
            placeholder="Yeni kural ekle..."
            className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none transition-all focus:border-ember/30 focus:bg-white/[0.06] backdrop-blur-sm"
          />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={addRule}
            disabled={!newRule.trim() || saving}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
              newRule.trim()
                ? "bg-ember text-white shadow-lg shadow-ember/20 hover:bg-ember/90"
                : "bg-white/[0.06] text-muted-foreground/30"
            }`}
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
            Ekle
          </motion.button>
        </div>
      </div>
    </GlassCard>
  );
}

function DangerSection({ guild }: { guild: Guild }) {
  const navigate = useNavigate();
  const [showTransfer, setShowTransfer] = useState(false);
  const [showDisband, setShowDisband] = useState(false);

  const handleDisband = async () => {
    try {
      const { error } = await supabase
        .from("guilds")
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq("id", guild.id);

      if (error) throw error;
      toast.success("Guild dağıtıldı.");
      navigate("/guilds");
    } catch (err: any) {
      toast.error("Guild dağıtılamadı: " + (err.message || ""));
    }
  };

  return (
    <>
      <GlassCard accentColor="#EF4444">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20">
              <AlertTriangle size={18} className="text-red-400" />
            </div>
            <div>
              <h3 className="font-display text-base tracking-wide text-red-400">Tehlikeli Bölge</h3>
              <p className="text-xs text-muted-foreground">Bu işlemler geri alınamaz</p>
            </div>
          </div>

          <div className="space-y-3">
            {/* Transfer ownership */}
            <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <div>
                <p className="text-sm font-medium text-foreground">Liderliği Devret</p>
                <p className="text-[11px] text-muted-foreground">Blacksmith rolünü başka bir üyeye aktar</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowTransfer(true)}
                className="flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-400 hover:bg-amber-500/20 transition-colors"
              >
                <Crown size={15} />
                Devret
              </motion.button>
            </div>

            {/* Disband guild */}
            <div className="flex items-center justify-between rounded-xl border border-red-500/10 bg-red-500/[0.03] p-4">
              <div>
                <p className="text-sm font-medium text-red-400">Guild'i Dağıt</p>
                <p className="text-[11px] text-muted-foreground">Lonca kalıcı olarak kapatılır, tüm veriler silinir</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowDisband(true)}
                className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-red-500/20 hover:bg-red-700 transition-colors"
              >
                <Ban size={15} />
                Dağıt
              </motion.button>
            </div>
          </div>
        </div>
      </GlassCard>

      <ConfirmDialog
        open={showTransfer}
        onClose={() => setShowTransfer(false)}
        onConfirm={() => setShowTransfer(false)}
        title="Liderliği Devret"
        message="Blacksmith rolünü devrettiğinde senin rolün Striker'a düşer. Bu işlemi onaylıyor musun?"
        confirmLabel="Liderliği Devret"
      />

      <ConfirmDialog
        open={showDisband}
        onClose={() => setShowDisband(false)}
        onConfirm={handleDisband}
        title="Guild'i Dağıt"
        message={`${guild.name} kalıcı olarak kapatılacak. Tüm üyeler çıkarılacak, tüm puanlar ve geçmiş silinecek. Bu işlem GERİ ALINAMAZ.`}
        confirmLabel="Kalıcı Olarak Dağıt"
        danger
      />
    </>
  );
}

// ============================================
// Main Component
// ============================================

export default function GuildManage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<SectionKey>("settings");
  const [guild, setGuild] = useState<Guild | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGuild = useCallback(async () => {
    if (!slug) {
      setError("Guild slug bulunamadı.");
      setLoading(false);
      return;
    }

    try {
      const { data, error: fetchError } = await supabase
        .from("guilds")
        .select("*")
        .eq("slug", slug)
        .eq("is_active", true)
        .single();

      if (fetchError) throw fetchError;
      if (!data) throw new Error("Guild bulunamadı.");

      setGuild(data as Guild);
    } catch (err: any) {
      setError(err.message || "Guild yüklenemedi.");
      toast.error("Guild yüklenemedi: " + (err.message || ""));
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchGuild();
  }, [fetchGuild]);

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner text="Guild yükleniyor..." />
      </div>
    );
  }

  if (error || !guild) {
    return (
      <div className="w-full flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <AlertCircle size={48} className="text-red-400" />
        <p className="text-lg text-muted-foreground">{error || "Guild bulunamadı."}</p>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate(-1)}
          className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-white/[0.08] transition-colors"
        >
          Geri Dön
        </motion.button>
      </div>
    );
  }

  const renderSection = () => {
    switch (activeSection) {
      case "settings": return <SettingsSection guild={guild} onSaved={fetchGuild} />;
      case "members": return <MembersSection guild={guild} />;
      case "quests": return <QuestsSection guild={guild} />;
      case "challenges": return <ChallengesSection guild={guild} />;
      case "vault": return <VaultSection guild={guild} />;
      case "rules": return <RulesSection guild={guild} onSaved={fetchGuild} />;
      case "danger": return <DangerSection guild={guild} />;
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-ember/20 to-ember-dark/20 border border-ember/30">
            <Hammer size={22} className="text-ember" />
          </div>
          <div>
            <h1 className="font-display text-2xl tracking-wide text-foreground">Guild Yönetimi</h1>
            <p className="text-sm text-muted-foreground">{guild.name} &middot; Blacksmith Paneli</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <TierBadge tier={guild.tier} size="md" />
          <HeatMeter level={guild.heat_level} size="sm" showLabel={false} />
        </div>
      </motion.div>

      {/* Section navigation tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        {SECTIONS.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.key;
          return (
            <motion.button
              key={section.key}
              onClick={() => setActiveSection(section.key)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`relative flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? "bg-white/[0.08] text-foreground"
                  : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="manage-tab"
                  className="absolute inset-0 rounded-xl border border-white/[0.08] bg-white/[0.06]"
                  style={{ boxShadow: `0 0 20px ${section.color}15` }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Icon size={15} className="relative z-10" style={isActive ? { color: section.color } : undefined} />
              <span className="relative z-10">{section.label}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Active section content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
        >
          {renderSection()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
