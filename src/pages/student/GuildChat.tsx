import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Hash, Lock, Flame, Swords, Send, Smile, Paperclip,
  Users, ChevronDown, AtSign, Bell, BellOff, Pin,
  MessageSquare, Circle, Loader2, Shield,
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
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useNavigate } from "react-router-dom";

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
  if (diffMin < 1) return "Simdi";
  if (diffMin < 60) return `${diffMin}dk once`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24)
    return `Bugun ${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
  return d.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
}

// ============================================
// Extended message type with sender role
// ============================================

type ChatMessage = GuildMessage & { senderRole: GuildRole };

// ============================================
// Component
// ============================================

export default function GuildChat() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [guildId, setGuildId] = useState<string | null>(null);
  const [guildName, setGuildName] = useState("");
  const [guildLevel, setGuildLevel] = useState(1);
  const [userRole, setUserRole] = useState<GuildRole>("raw");
  const [memberCount, setMemberCount] = useState(0);

  const [activeChannel, setActiveChannel] = useState<GuildChannel>("general");
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [unreadCounts, setUnreadCounts] = useState<Record<GuildChannel, number>>({
    general: 0,
    command: 0,
    forge_room: 0,
    war_room: 0,
  });
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const channelConfig = CHANNELS.find((c) => c.key === activeChannel)!;

  // ---- Fetch guild membership ----
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchGuild = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('guild_members')
          .select('guild_id, role, guilds(name, level, member_count)')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .maybeSingle();

        if (error) throw error;

        if (!data || !data.guilds) {
          setGuildId(null);
          setLoading(false);
          return;
        }

        const g = data.guilds as any;
        setGuildId(data.guild_id);
        setUserRole(data.role as GuildRole);
        setGuildName(g.name || '');
        setGuildLevel(g.level || 1);
        setMemberCount(g.member_count || 0);
      } catch (err: any) {
        console.error('Error fetching guild for chat:', err);
        toast({ title: 'Hata', description: 'Lonca bilgisi yüklenemedi.', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    fetchGuild();
  }, [user]);

  // ---- Fetch messages for active channel ----
  const fetchMessages = useCallback(async () => {
    if (!guildId) return;
    try {
      const { data, error } = await supabase
        .from('guild_messages')
        .select('*, profiles:user_id(full_name, avatar_url)')
        .eq('guild_id', guildId)
        .eq('channel', activeChannel)
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) throw error;

      const mapped: ChatMessage[] = (data || []).map((m: any) => ({
        id: m.id,
        guild_id: m.guild_id,
        user_id: m.user_id,
        channel: m.channel,
        content: m.content,
        created_at: m.created_at,
        profile: m.profiles || { full_name: 'Bilinmeyen', avatar_url: null },
        senderRole: 'raw' as GuildRole, // We don't have role in messages table, default
      }));
      setMessages(mapped);
    } catch (err: any) {
      console.error('Error fetching messages:', err);
    }
  }, [guildId, activeChannel]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // ---- Realtime subscription ----
  useEffect(() => {
    if (!guildId) return;

    const channel = supabase
      .channel(`guild-chat-${guildId}-${activeChannel}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'guild_messages',
          filter: `guild_id=eq.${guildId}`,
        },
        async (payload: any) => {
          const newMsg = payload.new;
          if (newMsg.channel !== activeChannel) {
            // Increment unread for other channel
            setUnreadCounts((prev) => ({
              ...prev,
              [newMsg.channel as GuildChannel]: (prev[newMsg.channel as GuildChannel] || 0) + 1,
            }));
            return;
          }

          // Fetch profile for the new message sender
          const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('user_id', newMsg.user_id)
            .maybeSingle();

          const chatMsg: ChatMessage = {
            id: newMsg.id,
            guild_id: newMsg.guild_id,
            user_id: newMsg.user_id,
            channel: newMsg.channel,
            content: newMsg.content,
            created_at: newMsg.created_at,
            profile: profileData || { full_name: 'Bilinmeyen', avatar_url: null },
            senderRole: 'raw' as GuildRole,
          };
          setMessages((prev) => [...prev, chatMsg]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [guildId, activeChannel]);

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

  const handleSend = async () => {
    const text = inputValue.trim();
    if (!text || !guildId || !user) return;

    setInputValue("");

    try {
      const { error } = await supabase.from('guild_messages').insert({
        guild_id: guildId,
        user_id: user.id,
        channel: activeChannel,
        content: text,
      });

      if (error) throw error;
    } catch (err: any) {
      console.error('Error sending message:', err);
      toast({ title: 'Hata', description: 'Mesaj gonderilemedi.', variant: 'destructive' });
      setInputValue(text); // Restore input on error
    }

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
    messages: ChatMessage[];
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

  // ---- Loading state ----
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 size={32} className="text-primary animate-spin" />
          <p className="text-muted-foreground text-sm">Chat yükleniyor...</p>
        </motion.div>
      </div>
    );
  }

  // ---- No guild state ----
  if (!guildId) {
    return (
      <div className="min-h-screen flex items-center justify-center pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-md"
        >
          <Shield size={64} className="mx-auto text-muted-foreground/30 mb-6" strokeWidth={1} />
          <h2 className="font-display text-2xl tracking-wider text-foreground mb-3">
            Henüz bir loncaya katılmadın
          </h2>
          <p className="text-muted-foreground text-sm mb-8">
            Chat özelliğini kullanmak için bir loncaya katılman gerekiyor.
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/guilds')}
            className="flex items-center gap-2 px-6 py-3 mx-auto rounded-xl bg-primary/10 border border-primary/30 text-primary font-semibold text-sm hover:bg-primary/20 transition-colors"
          >
            <Users size={18} />
            Loncaları Keşfet
          </motion.button>
        </motion.div>
      </div>
    );
  }

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
              {guildName}
            </h2>
            <p className="text-[10px] text-muted-foreground">Lv.{guildLevel}</p>
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
              {memberCount} üye
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
              <span>{memberCount}</span>
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
                const isOwn = user ? group.userId === user.id : false;
                const roleColor = GUILD_ROLE_COLORS[group.senderRole] || '#808080';
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
