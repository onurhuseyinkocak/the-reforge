import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Send,
  Clock,
  CheckCheck,
  MessageSquare,
  Flame,
  Sparkles,
  ArrowDown,
} from "lucide-react";
import { toast } from "sonner";
import { format, formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";

const Messages = () => {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [nextSession, setNextSession] = useState<any>(null);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const mentorId = profile?.mentor_id;

  const fetchMessages = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("messages").select("*")
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order("created_at", { ascending: true });
    setMessages(data || []);
    if (data) {
      const unread = data.filter(m => m.receiver_id === user.id && !m.is_read);
      if (unread.length > 0) {
        await supabase.from("messages").update({ is_read: true }).in("id", unread.map(m => m.id));
      }
    }
  };

  useEffect(() => {
    fetchMessages();
    if (user) {
      supabase.from("mentor_sessions").select("*").eq("student_id", user.id).eq("status", "scheduled")
        .gte("scheduled_at", new Date().toISOString()).order("scheduled_at", { ascending: true }).limit(1)
        .then(({ data }) => setNextSession(data?.[0]));
    }

    const channel = supabase.channel("messages_realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        const msg = payload.new as any;
        if (msg.sender_id === user?.id || msg.receiver_id === user?.id) {
          fetchMessages();
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    setShowScrollDown(scrollHeight - scrollTop - clientHeight > 100);
  };

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;
    if (!mentorId) { toast.error("Mentor atanmamış"); return; }
    setSending(true);
    const { error } = await supabase.from("messages").insert({
      sender_id: user.id, receiver_id: mentorId, content: newMessage.trim(),
    });
    setSending(false);
    if (error) toast.error("Mesaj gönderilemedi");
    else { setNewMessage(""); }
  };

  // Group messages by date
  const groupedMessages: { date: string; msgs: any[] }[] = [];
  let lastDate = "";
  messages.forEach(msg => {
    const dateStr = format(new Date(msg.created_at), "d MMMM yyyy", { locale: tr });
    if (dateStr !== lastDate) {
      groupedMessages.push({ date: dateStr, msgs: [] });
      lastDate = dateStr;
    }
    groupedMessages[groupedMessages.length - 1].msgs.push(msg);
  });

  return (
    <div className="relative flex flex-col h-[calc(100vh-8rem)]">
      {/* Background glow orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-32 -right-24 w-72 h-72 bg-[#FF4500]/[0.03] rounded-full blur-[100px]" />
        <div className="absolute bottom-20 -left-24 w-64 h-64 bg-orange-500/[0.02] rounded-full blur-[80px]" />
      </div>

      {/* Next session banner */}
      <AnimatePresence>
        {nextSession && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="relative z-10 mb-4"
          >
            <div className="rounded-xl bg-gradient-to-r from-[#FF4500]/10 to-orange-500/5 border border-[#FF4500]/15 backdrop-blur-xl p-3.5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#FF4500]/15 flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 text-[#FF4500]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white/40">Sonraki gorusme</p>
                <p className="text-sm text-white font-medium">
                  {format(new Date(nextSession.scheduled_at), "d MMM HH:mm", { locale: tr })}
                  <span className="text-white/30 font-normal ml-2">
                    ({formatDistanceToNow(new Date(nextSession.scheduled_at), { locale: tr, addSuffix: true })})
                  </span>
                </p>
              </div>
              <div className="w-2 h-2 rounded-full bg-[#FF4500] animate-pulse" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages area */}
      <div className="relative flex-1 rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl overflow-hidden shadow-xl">
        {/* Header bar */}
        <div className="px-5 py-3.5 border-b border-white/[0.04] bg-white/[0.02] flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF4500]/20 to-orange-500/10 flex items-center justify-center border border-white/[0.08]">
            <Flame className="w-4 h-4 text-[#FF4500]" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-white font-semibold">Mentor</p>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-[10px] text-white/30">Aktif</p>
            </div>
          </div>
        </div>

        {/* Scrollable messages */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-5 space-y-1"
          style={{ height: "calc(100% - 52px)" }}
        >
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center h-full py-20"
            >
              <div className="w-20 h-20 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-4">
                <MessageSquare className="w-9 h-9 text-white/[0.07]" />
              </div>
              <p className="text-white/20 text-sm">Henuz mesaj yok</p>
              <p className="text-white/10 text-xs mt-1">Mentoruna ilk mesajini gonder!</p>
            </motion.div>
          ) : (
            groupedMessages.map((group, gi) => (
              <div key={gi}>
                {/* Date divider */}
                <div className="flex items-center gap-3 my-5">
                  <div className="flex-1 h-px bg-white/[0.04]" />
                  <span className="text-[10px] text-white/15 font-medium px-2">{group.date}</span>
                  <div className="flex-1 h-px bg-white/[0.04]" />
                </div>

                {group.msgs.map((msg, mi) => {
                  const isMine = msg.sender_id === user?.id;
                  const isFirst = mi === 0 || group.msgs[mi - 1].sender_id !== msg.sender_id;
                  const isLast = mi === group.msgs.length - 1 || group.msgs[mi + 1]?.sender_id !== msg.sender_id;

                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 8, x: isMine ? 8 : -8 }}
                      animate={{ opacity: 1, y: 0, x: 0 }}
                      transition={{ duration: 0.3, delay: mi * 0.02 }}
                      className={`flex ${isMine ? "justify-end" : "justify-start"} ${isFirst ? "mt-3" : "mt-0.5"}`}
                    >
                      <div
                        className={`max-w-[75%] px-4 py-2.5 transition-all duration-200 ${
                          isMine
                            ? `bg-gradient-to-br from-[#FF4500] to-orange-600 text-white shadow-lg shadow-[#FF4500]/15 ${
                                isFirst && isLast
                                  ? "rounded-2xl"
                                  : isFirst
                                  ? "rounded-2xl rounded-br-lg"
                                  : isLast
                                  ? "rounded-2xl rounded-tr-lg"
                                  : "rounded-2xl rounded-r-lg"
                              }`
                            : `bg-white/[0.04] border border-white/[0.06] text-white/80 backdrop-blur-sm ${
                                isFirst && isLast
                                  ? "rounded-2xl"
                                  : isFirst
                                  ? "rounded-2xl rounded-bl-lg"
                                  : isLast
                                  ? "rounded-2xl rounded-tl-lg"
                                  : "rounded-2xl rounded-l-lg"
                              }`
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                        <div className={`flex items-center gap-1.5 mt-1 ${isMine ? "justify-end" : ""}`}>
                          <p className={`text-[10px] ${isMine ? "text-white/50" : "text-white/20"}`}>
                            {format(new Date(msg.created_at), "HH:mm")}
                          </p>
                          {isMine && (
                            <CheckCheck className={`w-3 h-3 ${msg.is_read ? "text-white/80" : "text-white/30"}`} />
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {/* Scroll to bottom button */}
        <AnimatePresence>
          {showScrollDown && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={scrollToBottom}
              className="absolute bottom-4 right-4 w-9 h-9 rounded-full bg-white/[0.06] border border-white/[0.08] backdrop-blur-xl flex items-center justify-center hover:bg-white/[0.1] transition-all shadow-lg"
            >
              <ArrowDown className="w-4 h-4 text-white/40" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Input area */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative z-10 mt-3"
      >
        <div className="flex gap-2.5 items-center p-2 rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-xl">
          <Input
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder="Mesajini yaz..."
            className="flex-1 bg-transparent border-0 text-white placeholder:text-white/15 focus-visible:ring-0 focus-visible:ring-offset-0 h-10 text-sm"
          />
          <Button
            onClick={sendMessage}
            disabled={sending || !newMessage.trim()}
            className={`rounded-xl h-10 w-10 p-0 transition-all duration-300 ${
              newMessage.trim()
                ? "bg-gradient-to-r from-[#FF4500] to-orange-600 shadow-lg shadow-[#FF4500]/20 hover:shadow-[#FF4500]/30"
                : "bg-white/[0.04] text-white/15"
            } border-0 disabled:opacity-30`}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default Messages;
