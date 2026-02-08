import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Search, ChevronRight } from "lucide-react";

const statusStyles: Record<string, string> = {
  active: "bg-green-500/20 text-green-400",
  "at-risk": "bg-orange-500/20 text-orange-400",
  inactive: "bg-red-500/20 text-red-400",
  completed: "bg-[#00A3FF]/20 text-[#00A3FF]",
};

const statusLabels: Record<string, string> = {
  active: "Aktif",
  "at-risk": "Risk",
  inactive: "Pasif",
  completed: "Tamamladı",
};

const AdminStudents = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    supabase.from("profiles").select("*").order("created_at", { ascending: false }).then(({ data }) => {
      setStudents(data || []);
    });
  }, []);

  const filtered = students.filter(s => {
    const matchSearch = s.full_name?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || s.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#F0F4F8]/40" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="İsim ara..." className="bg-[#0D1B2A] border-white/10 text-white pl-10" />
        </div>
        <div className="flex gap-2">
          {["all", "active", "at-risk", "inactive"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${filter === f ? "bg-[#00A3FF] text-white" : "bg-white/5 text-[#F0F4F8]/60 hover:bg-white/10"}`}>
              {f === "all" ? "Tümü" : statusLabels[f]}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Card className="bg-[#0D1B2A] border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-3 text-[#F0F4F8]/50 font-medium">İsim</th>
                <th className="text-left p-3 text-[#F0F4F8]/50 font-medium hidden sm:table-cell">Faz</th>
                <th className="text-left p-3 text-[#F0F4F8]/50 font-medium hidden sm:table-cell">Hafta</th>
                <th className="text-left p-3 text-[#F0F4F8]/50 font-medium">Seri 🔥</th>
                <th className="text-left p-3 text-[#F0F4F8]/50 font-medium">Durum</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id} className="border-b border-white/5 hover:bg-white/5 transition">
                  <td className="p-3 text-white font-medium">{s.full_name || "—"}</td>
                  <td className="p-3 text-[#F0F4F8]/60 hidden sm:table-cell">Faz {s.current_phase}</td>
                  <td className="p-3 text-[#F0F4F8]/60 hidden sm:table-cell">{s.current_week}/24</td>
                  <td className="p-3 text-orange-400">{s.streak}</td>
                  <td className="p-3">
                    <Badge className={statusStyles[s.status] || ""}>{statusLabels[s.status] || s.status}</Badge>
                  </td>
                  <td className="p-3">
                    <Link to={`/admin/students/${s.user_id}`} className="text-[#00A3FF] hover:text-[#00A3FF]/80">
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <p className="text-center py-8 text-[#F0F4F8]/40">Sonuç bulunamadı</p>}
      </Card>
    </div>
  );
};

export default AdminStudents;
