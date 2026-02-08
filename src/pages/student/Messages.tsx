import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Clock, CheckCheck } from "lucide-react";
import { toast } from "sonner";
import { format, formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";

const Messages = () => {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [nextSession, setNextSession] = useState<any>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const mentorId = profile?.mentor_id;

  const fetchMessages = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("messages").select("*")
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order("created_at", { ascending: true });
    setMessages(data || []);
    // Mark unread messages as read
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

    // Realtime messages
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

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {nextSession && (
        <Card className="bg-primary/10 border-primary/20 p-3 mb-4 flex items-center gap-3">
          <Clock className="w-4 h-4 text-primary" />
          <span className="text-sm text-foreground">
            Sonraki görüşme: {format(new Date(nextSession.scheduled_at), "d MMM HH:mm", { locale: tr })}
            {" "}({formatDistanceToNow(new Date(nextSession.scheduled_at), { locale: tr, addSuffix: true })})
          </span>
        </Card>
      )}

      <Card className="bg-card border-border/30 flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Henüz mesaj yok</p>
        ) : (
          messages.map(msg => {
            const isMine = msg.sender_id === user?.id;
            return (
              <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] rounded-xl px-4 py-2.5 ${isMine ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}`}>
                  <p className="text-sm">{msg.content}</p>
                  <div className={`flex items-center gap-1 mt-1 ${isMine ? "justify-end" : ""}`}>
                    <p className={`text-xs ${isMine ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                      {format(new Date(msg.created_at), "HH:mm")}
                    </p>
                    {isMine && (
                      <CheckCheck className={`w-3 h-3 ${msg.is_read ? "text-primary-foreground" : "text-primary-foreground/40"}`} />
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </Card>

      <div className="flex gap-2 mt-3">
        <Input
          value={newMessage} onChange={e => setNewMessage(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendMessage()}
          placeholder="Mesajını yaz..." className="bg-card border-border/30 text-foreground"
        />
        <Button onClick={sendMessage} disabled={sending || !newMessage.trim()} className="bg-primary hover:bg-primary/90">
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default Messages;
