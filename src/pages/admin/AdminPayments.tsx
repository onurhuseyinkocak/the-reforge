import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

const statusStyles: Record<string, string> = {
  paid: "bg-green-500/20 text-green-400",
  pending: "bg-yellow-500/20 text-yellow-400",
  overdue: "bg-red-500/20 text-red-400",
  refunded: "bg-ember-glow/20 text-ember-glow",
};

const statusLabels: Record<string, string> = {
  paid: "Ödendi", pending: "Bekliyor", overdue: "Gecikmiş", refunded: "İade",
};

const AdminPayments = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    supabase.from("payments").select("*, profiles!payments_user_id_fkey(full_name)")
      .order("due_date", { ascending: false }).then(({ data }) => setPayments(data || []));
  }, []);

  const filtered = filter === "all" ? payments : payments.filter(p => p.status === filter);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {["all", "paid", "pending", "overdue"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${filter === f ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}>
            {f === "all" ? "Tümü" : statusLabels[f]}
          </button>
        ))}
      </div>

      <Card className="bg-card border-border/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/30">
                <th className="text-left p-3 text-muted-foreground font-medium">Öğrenci</th>
                <th className="text-left p-3 text-muted-foreground font-medium">Tutar</th>
                <th className="text-left p-3 text-muted-foreground font-medium hidden sm:table-cell">Son Ödeme</th>
                <th className="text-left p-3 text-muted-foreground font-medium hidden sm:table-cell">Açıklama</th>
                <th className="text-left p-3 text-muted-foreground font-medium">Durum</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="border-b border-border/10">
                  <td className="p-3 text-foreground">{(p as any).profiles?.full_name || "—"}</td>
                  <td className="p-3 text-foreground font-medium">{p.amount} {p.currency}</td>
                  <td className="p-3 text-muted-foreground hidden sm:table-cell">{format(new Date(p.due_date), "d MMM yyyy", { locale: tr })}</td>
                  <td className="p-3 text-muted-foreground hidden sm:table-cell">{p.description || "—"}</td>
                  <td className="p-3"><Badge className={statusStyles[p.status]}>{statusLabels[p.status]}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <p className="text-center py-8 text-muted-foreground">Ödeme bulunamadı</p>}
      </Card>
    </div>
  );
};

export default AdminPayments;
