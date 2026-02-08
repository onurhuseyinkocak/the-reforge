import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const AdminMessages = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.from("profiles").select("*").order("full_name").then(({ data }) => setConversations(data || []));
  }, []);

  useEffect(() => {
    if (!selectedStudent || !user) return;
    supabase.from("messages").select("*")
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${selectedStudent}),and(sender_id.eq.${selectedStudent},receiver_id.eq.${user.id})`)
      .order("created_at", { ascending: true })
      .then(({ data }) => setMessages(data || []));
  }, [selectedStudent, user]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !selectedStudent) return;
    const { error } = await supabase.from("messages").insert({ sender_id: user.id, receiver_id: selectedStudent, content: newMessage.trim() });
    if (error) toast.error("Hata");
    else {
      setNewMessage("");
      supabase.from("messages").select("*")
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${selectedStudent}),and(sender_id.eq.${selectedStudent},receiver_id.eq.${user.id})`)
        .order("created_at", { ascending: true })
        .then(({ data }) => setMessages(data || []));
    }
  };

  return (
    <div className="flex gap-4 h-[calc(100vh-8rem)]">
      <Card className="bg-card border-border/30 w-64 shrink-0 overflow-y-auto hidden lg:block">
        <div className="p-3 border-b border-border/30">
          <p className="text-sm text-foreground font-medium">Konuşmalar</p>
        </div>
        {conversations.map(c => (
          <button key={c.user_id} onClick={() => setSelectedStudent(c.user_id)}
            className={`w-full text-left px-3 py-3 border-b border-border/10 transition ${selectedStudent === c.user_id ? "bg-primary/10" : "hover:bg-secondary"}`}>
            <p className={`text-sm ${selectedStudent === c.user_id ? "text-primary" : "text-foreground"}`}>{c.full_name || "—"}</p>
            <p className="text-xs text-muted-foreground">Faz {c.current_phase} · Hafta {c.current_week}</p>
          </button>
        ))}
      </Card>

      <div className="flex-1 flex flex-col">
        {!selectedStudent ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground">Bir öğrenci seçin</p>
          </div>
        ) : (
          <>
            <Card className="bg-card border-border/30 flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map(msg => {
                const isMine = msg.sender_id === user?.id;
                return (
                  <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[75%] rounded-xl px-4 py-2.5 ${isMine ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}`}>
                      <p className="text-sm">{msg.content}</p>
                      <p className={`text-xs mt-1 ${isMine ? "text-primary-foreground/60" : "text-muted-foreground"}`}>{format(new Date(msg.created_at), "HH:mm")}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </Card>
            <div className="flex gap-2 mt-3">
              <Input value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMessage()}
                placeholder="Mesaj yaz..." className="bg-card border-border/30 text-foreground" />
              <Button onClick={sendMessage} disabled={!newMessage.trim()} className="bg-primary hover:bg-primary/90">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminMessages;
