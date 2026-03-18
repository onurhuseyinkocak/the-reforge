import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, AlertCircle, CreditCard } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { motion } from "framer-motion";

const statusStyles: Record<string, string> = {
  paid: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  overdue: "bg-red-500/20 text-red-400 border-red-500/30",
  refunded: "bg-[#FF4500]/20 text-[#FF4500] border-[#FF4500]/30",
};

const statusLabels: Record<string, string> = {
  paid: "Ödendi", pending: "Bekliyor", overdue: "Gecikmiş", refunded: "İade",
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" as const } },
} as const;

const AdminPayments = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    supabase.from("payments").select("*, profiles!payments_user_id_fkey(full_name)")
      .order("due_date", { ascending: false }).then(({ data }) => setPayments(data || []));
  }, []);

  const filtered = filter === "all" ? payments : payments.filter(p => p.status === filter);

  const totalRevenue = payments.filter(p => p.status === "paid").reduce((s, p) => s + Number(p.amount), 0);
  const pendingCount = payments.filter(p => p.status === "pending").length;
  const overdueCount = payments.filter(p => p.status === "overdue").length;

  const summaryCards = [
    { icon: DollarSign, label: "Toplam Gelir", value: `₺${totalRevenue.toLocaleString()}`, color: "#22c55e", glow: "shadow-[0_0_25px_rgba(34,197,94,0.1)]" },
    { icon: CreditCard, label: "Toplam İşlem", value: payments.length, color: "#FF4500", glow: "shadow-[0_0_25px_rgba(255,69,0,0.1)]" },
    { icon: TrendingUp, label: "Bekleyen", value: pendingCount, color: "#eab308", glow: "shadow-[0_0_25px_rgba(234,179,8,0.1)]" },
    { icon: AlertCircle, label: "Gecikmiş", value: overdueCount, color: "#ef4444", glow: overdueCount > 0 ? "shadow-[0_0_25px_rgba(239,68,68,0.15)]" : "" },
  ];

  return (
    <div className="relative">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-40 left-1/3 w-80 h-80 bg-[#FF4500]/5 rounded-full blur-[120px]" />
      </div>

      <motion.div variants={container} initial="hidden" animate="show" className="relative space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {summaryCards.map((card, i) => (
            <motion.div key={i} variants={item} whileHover={{ y: -2 }}>
              <Card className={`relative overflow-hidden bg-white/[0.03] border-white/[0.06] backdrop-blur-xl p-4 ${card.glow} transition-all duration-300`}>
                <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, transparent, ${card.color}, transparent)` }} />
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${card.color}15` }}>
                    <card.icon className="w-4 h-4" style={{ color: card.color }} />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white font-display tracking-wide">{card.value}</p>
                    <p className="text-[10px] text-white/30">{card.label}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <motion.div variants={item} className="flex gap-2">
          {["all", "paid", "pending", "overdue"].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-all duration-300 ${
                filter === f
                  ? "bg-[#FF4500] text-white shadow-[0_0_20px_rgba(255,69,0,0.3)]"
                  : "bg-white/[0.03] text-white/40 border border-white/[0.06] hover:bg-white/[0.06] hover:text-white/60"
              }`}
            >
              {f === "all" ? "Tümü" : statusLabels[f]}
            </button>
          ))}
        </motion.div>

        {/* Table */}
        <motion.div variants={item}>
          <Card className="relative overflow-hidden bg-white/[0.03] border-white/[0.06] backdrop-blur-xl">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FF4500] to-transparent" />
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="text-left p-4 text-white/30 font-medium text-xs uppercase tracking-wider">Öğrenci</th>
                    <th className="text-left p-4 text-white/30 font-medium text-xs uppercase tracking-wider">Tutar</th>
                    <th className="text-left p-4 text-white/30 font-medium text-xs uppercase tracking-wider hidden sm:table-cell">Son Ödeme</th>
                    <th className="text-left p-4 text-white/30 font-medium text-xs uppercase tracking-wider hidden sm:table-cell">Açıklama</th>
                    <th className="text-left p-4 text-white/30 font-medium text-xs uppercase tracking-wider">Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p, i) => {
                    const isOverdue = p.status === "pending" && p.due_date < new Date().toISOString().split("T")[0];
                    return (
                      <motion.tr
                        key={p.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03, duration: 0.3 }}
                        className={`border-b border-white/[0.03] hover:bg-white/[0.04] transition-colors duration-200 ${isOverdue ? "bg-red-500/[0.02]" : ""}`}
                      >
                        <td className="p-4 text-white/80">{(p as any).profiles?.full_name || "—"}</td>
                        <td className="p-4">
                          <span className="text-white font-medium font-display tracking-wide">{p.amount}</span>
                          <span className="text-white/25 ml-1 text-xs">{p.currency}</span>
                        </td>
                        <td className="p-4 text-white/40 hidden sm:table-cell text-xs">
                          {format(new Date(p.due_date), "d MMM yyyy", { locale: tr })}
                        </td>
                        <td className="p-4 text-white/30 hidden sm:table-cell text-xs">{p.description || "—"}</td>
                        <td className="p-4">
                          <Badge className={`${statusStyles[isOverdue ? "overdue" : p.status] || statusStyles[p.status]} border text-xs`}>
                            {isOverdue ? statusLabels["overdue"] : statusLabels[p.status]}
                          </Badge>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 && (
              <div className="text-center py-12">
                <CreditCard className="w-10 h-10 text-white/10 mx-auto mb-3" />
                <p className="text-white/20">Ödeme bulunamadı</p>
              </div>
            )}
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AdminPayments;
