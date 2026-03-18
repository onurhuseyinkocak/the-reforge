import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, MessageCircle, User } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

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

  const selectedProfile = conversations.find(c => c.user_id === selectedStudent);

  return (
    <div className="relative">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-[#FF4500]/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative flex gap-4 h-[calc(100vh-8rem)]">
        {/* Sidebar */}
        <Card className="relative overflow-hidden bg-white/[0.03] border-white/[0.06] backdrop-blur-xl w-72 shrink-0 hidden lg:flex flex-col">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FF4500] to-transparent" />
          <div className="p-4 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-[#FF4500]" />
              <p className="text-sm text-white font-medium tracking-wide">Konuşmalar</p>
            </div>
          </div>
          <div className="overflow-y-auto flex-1">
            {conversations.map(c => (
              <motion.button
                key={c.user_id}
                onClick={() => setSelectedStudent(c.user_id)}
                whileHover={{ x: 2 }}
                className={`w-full text-left px-4 py-3.5 border-b border-white/[0.03] transition-all duration-200 ${
                  selectedStudent === c.user_id
                    ? "bg-[#FF4500]/10 border-l-2 border-l-[#FF4500]"
                    : "hover:bg-white/[0.03] border-l-2 border-l-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                    selectedStudent === c.user_id
                      ? "bg-[#FF4500]/20 text-[#FF4500]"
                      : "bg-white/[0.05] text-white/30"
                  }`}>
                    {c.full_name?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <div className="min-w-0">
                    <p className={`text-sm truncate ${selectedStudent === c.user_id ? "text-[#FF4500]" : "text-white/70"}`}>
                      {c.full_name || "—"}
                    </p>
                    <p className="text-[10px] text-white/20">Faz {c.current_phase} · Hafta {c.current_week}</p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </Card>

        {/* Chat area */}
        <div className="flex-1 flex flex-col">
          {!selectedStudent ? (
            <div className="flex-1 flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-7 h-7 text-white/10" />
                </div>
                <p className="text-white/20">Bir öğrenci seçin</p>
              </motion.div>
            </div>
          ) : (
            <>
              {/* Chat header */}
              {selectedProfile && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-3"
                >
                  <Card className="relative overflow-hidden bg-white/[0.03] border-white/[0.06] backdrop-blur-xl px-5 py-3.5">
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FF4500] to-transparent" />
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#FF4500]/10 border border-[#FF4500]/20 flex items-center justify-center">
                        <User className="w-4 h-4 text-[#FF4500]" />
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">{selectedProfile.full_name}</p>
                        <p className="text-[10px] text-white/25">Faz {selectedProfile.current_phase} · Hafta {selectedProfile.current_week}</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* Messages */}
              <Card className="relative overflow-hidden bg-white/[0.03] border-white/[0.06] backdrop-blur-xl flex-1 overflow-y-auto p-5 space-y-3">
                <AnimatePresence>
                  {messages.map((msg, i) => {
                    const isMine = msg.sender_id === user?.id;
                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ delay: i * 0.02 }}
                        className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                            isMine
                              ? "bg-[#FF4500] text-white shadow-[0_0_20px_rgba(255,69,0,0.2)]"
                              : "bg-white/[0.05] border border-white/[0.08] text-white/90"
                          }`}
                        >
                          <p className="text-sm leading-relaxed">{msg.content}</p>
                          <p className={`text-[10px] mt-1.5 ${isMine ? "text-white/50" : "text-white/20"}`}>
                            {format(new Date(msg.created_at), "HH:mm")}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                <div ref={bottomRef} />
              </Card>

              {/* Input */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3 mt-3"
              >
                <Input
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && sendMessage()}
                  placeholder="Mesaj yaz..."
                  className="bg-white/[0.03] border-white/[0.06] text-white placeholder:text-white/20 focus:border-[#FF4500]/40 focus:ring-[#FF4500]/20 backdrop-blur-xl transition-all h-11"
                />
                <Button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-[#FF4500] hover:bg-[#FF4500]/80 text-white border-0 shadow-[0_0_20px_rgba(255,69,0,0.3)] hover:shadow-[0_0_30px_rgba(255,69,0,0.5)] disabled:shadow-none transition-all duration-300 h-11 px-5"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </motion.div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminMessages;
