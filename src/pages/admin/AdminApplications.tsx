import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Clock, ChevronDown, ChevronUp, FileText, Mail, Phone, User } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

const AdminApplications = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchApps = async () => {
    const { data } = await supabase.from("applications").select("*").order("created_at", { ascending: false });
    setApplications(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchApps(); }, []);

  const handleAction = async (id: string, status: "approved" | "rejected") => {
    const app = applications.find(a => a.id === id);
    const { error } = await supabase.from("applications").update({
      status, reviewed_by: user?.id, reviewed_at: new Date().toISOString(),
    }).eq("id", id);
    if (error) {
      toast.error("Hata: " + error.message);
      return;
    }

    // Send email notification
    if (app) {
      try {
        if (status === "approved") {
          await supabase.functions.invoke("send-email", {
            body: {
              to: app.email,
              subject: "THE FORGE \u2014 Ba\u015fvurun Onayland\u0131!",
              template: "application_approved",
              data: {
                name: app.full_name,
                loginUrl: window.location.origin + "/login",
              },
            },
          });
        } else {
          await supabase.functions.invoke("send-email", {
            body: {
              to: app.email,
              subject: "THE FORGE \u2014 Ba\u015fvuru Sonucu",
              template: "application_rejected",
              data: {
                name: app.full_name,
              },
            },
          });
        }
      } catch (emailErr: any) {
        console.error("Email gonderim hatasi:", emailErr);
        // Don't block — status is already updated
      }
    }

    toast.success(status === "approved" ? "Ba\u015fvuru onayland\u0131 ve email g\u00f6nderildi" : "Ba\u015fvuru reddedildi ve email g\u00f6nderildi");
    fetchApps();
  };

  const statusBadge = (s: string) => {
    if (s === "approved") return <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Onaylandı</Badge>;
    if (s === "rejected") return <Badge className="bg-red-500/20 text-red-400 border border-red-500/30">Reddedildi</Badge>;
    return <Badge className="bg-[#FF4500]/20 text-[#FF4500] border border-[#FF4500]/30">Bekliyor</Badge>;
  };

  const pendingCount = applications.filter(a => a.status === "pending").length;
  const approvedCount = applications.filter(a => a.status === "approved").length;
  const rejectedCount = applications.filter(a => a.status === "rejected").length;

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-2 border-[#FF4500] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="relative">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-1/3 w-96 h-96 bg-[#FF4500]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-40 left-1/4 w-72 h-72 bg-purple-500/3 rounded-full blur-[100px]" />
      </div>

      <motion.div variants={container} initial="hidden" animate="show" className="relative space-y-6">
        {/* Header */}
        <motion.div variants={item} className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-3xl text-white tracking-wide">Başvurular</h2>
            <p className="text-sm text-white/25 mt-1">Toplam {applications.length} başvuru</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs">
              <div className="w-2 h-2 rounded-full bg-[#FF4500]" />
              <span className="text-white/40">{pendingCount} bekliyor</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-white/40">{approvedCount} onaylı</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-white/40">{rejectedCount} red</span>
            </div>
          </div>
        </motion.div>

        {/* Application Cards */}
        {applications.map((app, i) => (
          <motion.div
            key={app.id}
            variants={item}
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="relative overflow-hidden bg-white/[0.03] border-white/[0.06] backdrop-blur-xl">
              <div className="absolute top-0 left-0 right-0 h-[2px]" style={{
                background: app.status === "pending"
                  ? "linear-gradient(90deg, transparent, #FF4500, transparent)"
                  : app.status === "approved"
                  ? "linear-gradient(90deg, transparent, #22c55e, transparent)"
                  : "linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)"
              }} />

              {/* Header row */}
              <div
                className="flex items-center justify-between p-5 cursor-pointer group"
                onClick={() => setExpandedId(expandedId === app.id ? null : app.id)}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-display text-lg ${
                    app.status === "pending"
                      ? "bg-[#FF4500]/10 text-[#FF4500] border border-[#FF4500]/20"
                      : app.status === "approved"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-white/[0.05] text-white/30 border border-white/[0.06]"
                  }`}>
                    {app.full_name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white font-medium group-hover:text-[#FF4500] transition-colors">{app.full_name}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="flex items-center gap-1 text-xs text-white/25">
                        <Mail className="w-3 h-3" /> {app.email}
                      </span>
                      <span className="text-xs text-white/15">
                        {format(new Date(app.created_at), "d MMM yyyy", { locale: tr })}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {statusBadge(app.status)}
                  <motion.div
                    animate={{ rotate: expandedId === app.id ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-4 h-4 text-white/20" />
                  </motion.div>
                </div>
              </div>

              {/* Expanded content */}
              <AnimatePresence>
                {expandedId === app.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 space-y-5 border-t border-white/[0.05] pt-5">
                      {/* Info grid */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2.5 bg-white/[0.02] border border-white/[0.04] rounded-xl p-3">
                          <Phone className="w-4 h-4 text-white/20" />
                          <div>
                            <p className="text-[10px] text-white/25 uppercase tracking-wider">Telefon</p>
                            <p className="text-sm text-white/70">{app.phone || "—"}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2.5 bg-white/[0.02] border border-white/[0.04] rounded-xl p-3">
                          <User className="w-4 h-4 text-white/20" />
                          <div>
                            <p className="text-[10px] text-white/25 uppercase tracking-wider">Yaş</p>
                            <p className="text-sm text-white/70">{app.age || "—"}</p>
                          </div>
                        </div>
                      </div>

                      {/* Situation Ratings */}
                      {app.situation_ratings && (
                        <div>
                          <p className="text-xs text-white/30 mb-3 uppercase tracking-wider font-medium">Durum Değerlendirmesi</p>
                          <div className="grid grid-cols-2 gap-2">
                            {Object.entries(app.situation_ratings as Record<string, number>).map(([key, val]) => (
                              <div key={key} className="flex items-center justify-between bg-white/[0.02] border border-white/[0.04] p-3 rounded-xl">
                                <span className="text-white/50 capitalize text-sm">{key}</span>
                                <div className="flex items-center gap-2">
                                  <div className="w-16 h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                                    <motion.div
                                      initial={{ width: 0 }}
                                      animate={{ width: `${(val as number) * 10}%` }}
                                      transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                                      className="h-full rounded-full"
                                      style={{
                                        backgroundColor: val >= 7 ? "#22c55e" : val >= 4 ? "#FF4500" : "#ef4444"
                                      }}
                                    />
                                  </div>
                                  <span className={`font-bold text-sm font-display ${
                                    val >= 7 ? "text-emerald-400" : val >= 4 ? "text-[#FF4500]" : "text-red-400"
                                  }`}>
                                    {val}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Commitment Answers */}
                      {app.commitment_answers && Array.isArray(app.commitment_answers) && (
                        <div className="space-y-3">
                          <p className="text-xs text-white/30 uppercase tracking-wider font-medium">Kararlılık Cevapları</p>
                          {(app.commitment_answers as any[]).map((qa: any, idx: number) => (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.06 }}
                              className="bg-white/[0.02] border border-white/[0.04] p-4 rounded-xl"
                            >
                              <p className="text-[10px] text-white/25 mb-1.5 uppercase tracking-wider">{qa.question}</p>
                              <p className="text-sm text-white/70 leading-relaxed">{qa.answer}</p>
                            </motion.div>
                          ))}
                        </div>
                      )}

                      {/* Actions */}
                      {app.status === "pending" && (
                        <div className="flex gap-3 pt-2">
                          <Button
                            onClick={() => handleAction(app.id, "approved")}
                            className="flex-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 hover:shadow-[0_0_20px_rgba(34,197,94,0.2)] transition-all duration-300 h-11"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-2" /> Onayla
                          </Button>
                          <Button
                            onClick={() => handleAction(app.id, "rejected")}
                            className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:shadow-[0_0_20px_rgba(239,68,68,0.15)] transition-all duration-300 h-11"
                          >
                            <XCircle className="w-4 h-4 mr-2" /> Reddet
                          </Button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        ))}

        {/* Empty state */}
        {applications.length === 0 && (
          <motion.div variants={item}>
            <Card className="relative overflow-hidden bg-white/[0.03] border-white/[0.06] backdrop-blur-xl p-12 text-center">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <Clock className="w-12 h-12 text-white/10 mx-auto mb-3" />
              <p className="text-white/20">Henüz başvuru yok</p>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default AdminApplications;
