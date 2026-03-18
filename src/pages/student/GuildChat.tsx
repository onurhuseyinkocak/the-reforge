import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Hash, Lock, Flame, Swords, Send, Smile, Paperclip,
  Users, ChevronDown, AtSign, Bell, BellOff, Pin,
  MessageSquare, Circle,
} from "lucide-react";
import {
  type GuildChannel,
  type GuildMessage,
  type GuildRole,
  GUILD_ROLE_LABELS,
  GUILD_ROLE_COLORS,
} from "@/types/guild";
import RoleBadge from "@/components/guild/RoleBadge";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// ============================================
// Channel Configuration
// ============================================

interface ChannelConfig {
  key: GuildChannel;
  label: string;
  description: string;
  icon: React.ElementType;
  restricted: boolean;
  restrictedRoles?: GuildRole[];
}

const CHANNELS: ChannelConfig[] = [
  {
    key: "general",
    label: "General",
    description: "Herkes konuşabilir, serbest sohbet",
    icon: Hash,
    restricted: false,
  },
  {
    key: "command",
    label: "Command",
    description: "Yönetim kararları ve duyurular",
    icon: Lock,
    restricted: true,
    restrictedRoles: ["blacksmith", "striker"],
  },
  {
    key: "forge_room",
    label: "Forge Room",
    description: "Mentorluk ve bilgi paylaşımı",
    icon: Flame,
    restricted: false,
  },
  {
    key: "war_room",
    label: "War Room",
    description: "Challenge stratejileri ve koordinasyon",
    icon: Swords,
    restricted: false,
  },
];

// ============================================
// Mock Users
// ============================================

interface MockUser {
  id: string;
  name: string;
  avatar_url: string | null;
  role: GuildRole;
  isOnline: boolean;
}

const MOCK_USERS: MockUser[] = [
  { id: "u1", name: "Kaan Yılmaz", avatar_url: null, role: "blacksmith", isOnline: true },
  { id: "u2", name: "Elif Demir", avatar_url: null, role: "striker", isOnline: true },
  { id: "u3", name: "Ahmet Korkmaz", avatar_url: null, role: "tempered", isOnline: true },
  { id: "u4", name: "Zeynep Aksoy", avatar_url: null, role: "tempered", isOnline: false },
  { id: "u5", name: "Burak Çelik", avatar_url: null, role: "heated", isOnline: true },
  { id: "u6", name: "Selin Kaya", avatar_url: null, role: "heated", isOnline: false },
  { id: "u7", name: "Emre Aydın", avatar_url: null, role: "raw", isOnline: true },
  { id: "u8", name: "Defne Şahin", avatar_url: null, role: "raw", isOnline: false },
  { id: "u9", name: "Arda Öztürk", avatar_url: null, role: "heated", isOnline: true },
  { id: "u10", name: "Ceren Yıldız", avatar_url: null, role: "tempered", isOnline: true },
];

const CURRENT_USER_ID = "u1";

// ============================================
// Mock Messages
// ============================================

function makeMsg(
  id: string,
  userId: string,
  channel: GuildChannel,
  content: string,
  minutesAgo: number
): GuildMessage & { senderRole: GuildRole } {
  const user = MOCK_USERS.find((u) => u.id === userId)!;
  const ts = new Date(Date.now() - minutesAgo * 60000).toISOString();
  return {
    id,
    guild_id: "1",
    user_id: userId,
    channel,
    content,
    created_at: ts,
    profile: { full_name: user.name, avatar_url: user.avatar_url },
    senderRole: user.role,
  };
}

const MOCK_MESSAGES: (GuildMessage & { senderRole: GuildRole })[] = [
  // General
  makeMsg("g1", "u1", "general", "Günaydın ekip! Bugün streak güncellemelerinizi paylaşın.", 120),
  makeMsg("g2", "u5", "general", "21 gün streak kırdım! 🔥 Artık duramıyorum.", 115),
  makeMsg("g3", "u3", "general", "Helal olsun Burak! Ben de 28'e geldim, devam ediyoruz.", 110),
  makeMsg("g4", "u7", "general", "Yeni katıldım, herkese merhaba! Nasıl hızlı adapte olabilirim?", 95),
  makeMsg("g5", "u2", "general", "Hoş geldin Emre! İlk hafta günlük check-in yapmayı unutma, streak çok önemli.", 90),
  makeMsg("g6", "u10", "general", "Bu haftaki quest'leri gördünüz mü? Brotherhood görevi ilginç görünüyor.", 45),
  makeMsg("g7", "u9", "general", "Evet baktım, beraber yapabiliriz. Kim katılmak ister?", 40),
  makeMsg("g8", "u1", "general", "Güzel fikir! En az 5 kişi olalım, herkesi etiketliyorum.", 30),

  // Command
  makeMsg("c1", "u1", "command", "Bu hafta heat level'ımız 92'ye çıktı, harika iş çıkarıyorsunuz.", 180),
  makeMsg("c2", "u2", "command", "Yeni başvurular geldi. 3 aday var, profillerini inceledim. 2'si uygun görünüyor.", 160),
  makeMsg("c3", "u1", "command", "Arda'yı Tempered'a terfi ettirelim mi? Contribution puanı yeterli.", 60),

  // Forge Room
  makeMsg("f1", "u3", "forge_room", "Phase 2 Week 4'teyim, resource planlaması konusunda tavsiye lazım.", 200),
  makeMsg("f2", "u2", "forge_room", "Ben de o aşamadaydım, Pomodoro tekniği ile 3 saat bloklar oluştur. Çok işe yaradı.", 190),

  // War Room
  makeMsg("w1", "u1", "war_room", "Steel Phoenix'e Spark Duel challenge'ı attık! 3 gün sonra başlıyor.", 300),
  makeMsg("w2", "u5", "war_room", "Hazırız! Herkese günlük hedef: en az 150 puan toplayın.", 280),
];

// ============================================
// Unread counts
// ============================================

const UNREAD_COUNTS: Record<GuildChannel, number> = {
  general: 3,
  command: 1,
  forge_room: 0,
  war_room: 2,
};

// ============================================
// Helpers
// ============================================

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffMin = Math.floor((now.getTime() - d.getTime()) / 60000);
  if (diffMin < 1) return "Şimdi";
  if (diffMin < 60) return `${diffMin}dk önce`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24)
    return `Bugün ${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
  return d.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
}

// ============================================
// Component
// ============================================

export default function GuildChat() {
  const [activeChannel, setActiveChannel] = useState<GuildChannel>("general");
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [unreadCounts, setUnreadCounts] = useState(UNREAD_COUNTS);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const channelConfig = CHANNELS.find((c) => c.key === activeChannel)!;

  const channelMessages = useMemo(
    () =>
      messages
        .filter((m) => m.channel === activeChannel)
        .sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        ),
    [messages, activeChannel]
  );

  const onlineCount = MOCK_USERS.filter((u) => u.isOnline).length;

  // Scroll to bottom on channel switch or new message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [channelMessages.length, activeChannel]);

  // Clear unread when switching channels
  useEffect(() => {
    setUnreadCounts((prev) => ({ ...prev, [activeChannel]: 0 }));
  }, [activeChannel]);

  const handleSend = () => {
    const text = inputValue.trim();
    if (!text) return;
    const newMsg: GuildMessage & { senderRole: GuildRole } = {
      id: `new-${Date.now()}`,
      guild_id: "1",
      user_id: CURRENT_USER_ID,
      channel: activeChannel,
      content: text,
      created_at: new Date().toISOString(),
      profile: { full_name: "Kaan Yılmaz", avatar_url: null },
      senderRole: "blacksmith",
    };
    setMessages((prev) => [...prev, newMsg]);
    setInputValue("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ============================================
  // Grouped messages (consecutive same-user messages)
  // ============================================

  interface MessageGroup {
    userId: string;
    senderRole: GuildRole;
    profile: { full_name: string; avatar_url: string | null };
    messages: (GuildMessage & { senderRole: GuildRole })[];
  }

  const groupedMessages = useMemo(() => {
    const groups: MessageGroup[] = [];
    channelMessages.forEach((msg) => {
      const last = groups[groups.length - 1];
      const timeDiff =
        last && last.messages.length > 0
          ? new Date(msg.created_at).getTime() -
            new Date(last.messages[last.messages.length - 1].created_at).getTime()
          : Infinity;
      if (last && last.userId === msg.user_id && timeDiff < 5 * 60000) {
        last.messages.push(msg);
      } else {
        groups.push({
          userId: msg.user_id,
          senderRole: msg.senderRole,
          profile: msg.profile || { full_name: "Bilinmeyen", avatar_url: null },
          messages: [msg],
        });
      }
    });
    return groups;
  }, [channelMessages]);

  return (
    <div className="flex h-[calc(100vh-80px)] max-h-[900px] w-full overflow-hidden rounded-2xl border border-white/[0.06] bg-black/40 backdrop-blur-2xl">
      {/* ====== Left Sidebar: Channels ====== */}
      <div className="flex w-[220px] shrink-0 flex-col border-r border-white/[0.06] bg-white/[0.02]">
        {/* Guild name header */}
        <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-ember/20 to-ember-dark/20 border border-ember/30">
            <Flame size={16} className="text-ember" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="truncate font-display text-sm tracking-wide text-foreground">
              IRON WOLVES
            </h2>
            <p className="text-[10px] text-muted-foreground">Lv.7 Shield</p>
          </div>
        </div>

        {/* Channel list */}
        <div className="flex-1 overflow-y-auto px-2 py-3">
          <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
            Kanallar
          </p>
          {CHANNELS.map((ch) => {
            const isActive = activeChannel === ch.key;
            const Icon = ch.icon;
            const unread = unreadCounts[ch.key];
            return (
              <TooltipProvider key={ch.key} delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.button
                      onClick={() => setActiveChannel(ch.key)}
                      className={`group relative mb-0.5 flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-all ${
                        isActive
                          ? "bg-white/[0.08] text-foreground"
                          : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"
                      }`}
                      whileTap={{ scale: 0.98 }}
                    >
                      {/* Active indicator */}
                      {isActive && (
                        <motion.div
                          layoutId="channel-active"
                          className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-ember"
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                      )}
                      <Icon
                        size={16}
                        className={
                          isActive
                            ? "text-ember"
                            : "text-muted-foreground/60 group-hover:text-muted-foreground"
                        }
                      />
                      <span className="flex-1 truncate text-sm font-medium">
                        {ch.label}
                      </span>
                      {/* Unread badge */}
                      <AnimatePresence>
                        {unread > 0 && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="flex h-5 min-w-5 items-center justify-center rounded-full bg-ember/90 px-1.5 text-[10px] font-bold text-white"
                          >
                            {unread}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="text-xs">
                    <p className="font-medium">{ch.label}</p>
                    <p className="text-muted-foreground">{ch.description}</p>
                    {ch.restricted && (
                      <p className="mt-1 text-amber-400 text-[10px]">
                        Sadece {ch.restrictedRoles?.map((r) => GUILD_ROLE_LABELS[r]).join(", ")}
                      </p>
                    )}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>

        {/* Online members */}
        <div className="border-t border-white/[0.06] px-3 py-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="relative">
              <Users size={14} />
              <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-black/60" />
            </div>
            <span className="text-xs">
              {onlineCount} çevrimiçi
            </span>
          </div>
        </div>
      </div>

      {/* ====== Main Chat Area ====== */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Channel header */}
        <div className="flex items-center justify-between border-b border-white/[0.06] bg-white/[0.02] px-5 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.06]">
              <channelConfig.icon
                size={16}
                className={channelConfig.restricted ? "text-amber-400" : "text-muted-foreground"}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-sm tracking-wide text-foreground">
                  {channelConfig.label}
                </h3>
                {channelConfig.restricted && (
                  <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-400 border border-amber-500/20">
                    Kısıtlı
                  </span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground">
                {channelConfig.description}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-lg bg-white/[0.04] px-3 py-1.5 text-xs text-muted-foreground">
              <Users size={13} />
              <span>{onlineCount}/{MOCK_USERS.length}</span>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="rounded-lg p-2 text-muted-foreground hover:bg-white/[0.06] hover:text-foreground transition-colors"
            >
              <Pin size={15} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="rounded-lg p-2 text-muted-foreground hover:bg-white/[0.06] hover:text-foreground transition-colors"
            >
              <Bell size={15} />
            </motion.button>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 scroll-smooth">
          {channelMessages.length === 0 ? (
            /* Empty state */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex h-full flex-col items-center justify-center gap-4"
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/[0.04] border border-white/[0.06]">
                <MessageSquare size={32} className="text-muted-foreground/40" />
              </div>
              <div className="text-center">
                <p className="font-display text-lg tracking-wide text-foreground/60">
                  Henüz mesaj yok
                </p>
                <p className="mt-1 text-sm text-muted-foreground/50">
                  İlk mesajı gönderen sen ol!
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-0">
              {groupedMessages.map((group, gi) => {
                const isOwn = group.userId === CURRENT_USER_ID;
                const userMeta = MOCK_USERS.find((u) => u.id === group.userId);
                const roleColor = GUILD_ROLE_COLORS[group.senderRole];
                return (
                  <motion.div
                    key={`group-${gi}`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: gi * 0.04 }}
                    className={`group/msg flex gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-white/[0.02] ${
                      isOwn ? "" : ""
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative mt-0.5 shrink-0">
                      <Avatar className="h-9 w-9 border border-white/[0.08]">
                        <AvatarImage src={group.profile.avatar_url || undefined} />
                        <AvatarFallback
                          className="text-[11px] font-bold"
                          style={{
                            background: `linear-gradient(135deg, ${roleColor}33, ${roleColor}11)`,
                            color: roleColor,
                          }}
                        >
                          {getInitials(group.profile.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      {/* Online indicator */}
                      {userMeta?.isOnline && (
                        <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 ring-2 ring-black/80" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      {/* Header row */}
                      <div className="flex items-center gap-2 mb-0.5">
                        <span
                          className="text-sm font-semibold"
                          style={{ color: isOwn ? roleColor : undefined }}
                        >
                          {group.profile.full_name}
                        </span>
                        <RoleBadge role={group.senderRole} size="sm" />
                        <span className="text-[10px] text-muted-foreground/50">
                          {formatTime(group.messages[0].created_at)}
                        </span>
                      </div>

                      {/* Messages in group */}
                      {group.messages.map((msg, mi) => (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2, delay: mi * 0.05 }}
                          className="group/line relative"
                        >
                          <p
                            className={`text-[13px] leading-relaxed ${
                              isOwn
                                ? "text-foreground"
                                : "text-foreground/90"
                            }`}
                          >
                            {msg.content}
                          </p>
                          {/* Timestamp for subsequent messages */}
                          {mi > 0 && (
                            <span className="absolute -left-12 top-0.5 hidden text-[9px] text-muted-foreground/30 group-hover/line:inline">
                              {new Date(msg.created_at).toLocaleTimeString("tr-TR", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Message Input */}
        <div className="border-t border-white/[0.06] p-4">
          <div className="relative rounded-xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-xl transition-all focus-within:border-ember/30 focus-within:bg-white/[0.06] focus-within:shadow-[0_0_20px_rgba(255,69,0,0.08)]">
            <div className="flex items-center gap-2 px-4 py-3">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="text-muted-foreground/50 hover:text-muted-foreground transition-colors"
              >
                <Paperclip size={18} />
              </motion.button>
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`#${channelConfig.label} kanalına mesaj yaz...`}
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 outline-none"
              />
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="text-muted-foreground/50 hover:text-muted-foreground transition-colors"
              >
                <AtSign size={18} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="text-muted-foreground/50 hover:text-muted-foreground transition-colors"
              >
                <Smile size={18} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSend}
                disabled={!inputValue.trim()}
                className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all ${
                  inputValue.trim()
                    ? "bg-ember text-white shadow-lg shadow-ember/25 hover:bg-ember/90"
                    : "bg-white/[0.06] text-muted-foreground/30"
                }`}
              >
                <Send size={14} />
              </motion.button>
            </div>
          </div>
          <p className="mt-2 text-center text-[10px] text-muted-foreground/30">
            Enter ile gönder &middot; Shift+Enter ile satır atla
          </p>
        </div>
      </div>
    </div>
  );
}
