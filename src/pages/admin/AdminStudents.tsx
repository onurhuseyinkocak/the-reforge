import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Search, ChevronRight, Flame, Calendar } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { motion } from "framer-motion";

const statusStyles: Record<string, string> = {
  active: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  "at-risk": "bg-orange-500/20 text-orange-400 border-orange-500/30",
  inactive: "bg-red-500/20 text-red-400 border-red-500/30",
  completed: "bg-[#FF4500]/20 text-[#FF4500] border-[#FF4500]/30",
};

const statusLabels: Record<string, string> = {
  active: "Aktif", "at-risk": "Risk", inactive: "Pasif", completed: "Tamamladı",
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" as const } },
} as const;

const AdminStudents = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [lastCheckins, setLastCheckins] = useState<Record<string, string>>({});

  useEffect(() => {
    supabase.from("profiles").select("*").order("created_at", { ascending: false }).then(({ data }) => setStudents(data || []));
    supabase.from("checkins").select("user_id, checkin_date").order("checkin_date", { ascending: false }).then(({ data }) => {
      const map: Record<string, string> = {};
      (data || []).forEach(c => { if (!map[c.user_id]) map[c.user_id] = c.checkin_date; });
      setLastCheckins(map);
    });
  }, []);

  const filtered = students.filter(s => {
    const matchSearch = s.full_name?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || s.status === filter;
    return matchSearch && matchFilter;
  });

  const filters = ["all", "active", "at-risk", "inactive"];

  return (
    <div className="relative">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-40 right-1/4 w-80 h-80 bg-[#FF4500]/5 rounded-full blur-[120px]" />
      </div>

      <motion.div variants={container} initial="hidden" animate="show" className="relative space-y-5">
        {/* Search & Filters */}
        <motion.div variants={item} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="İsim ara..."
              className="bg-white/[0.03] border-white/[0.06] text-white pl-10 placeholder:text-white/25 focus:border-[#FF4500]/40 focus:ring-[#FF4500]/20 backdrop-blur-xl transition-all"
            />
          </div>
          <div className="flex gap-2">
            {filters.map(f => (
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
          </div>
        </motion.div>

        {/* Table */}
        <motion.div variants={item}>
          <Card className="relative overflow-hidden bg-white/[0.03] border-white/[0.06] backdrop-blur-xl">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FF4500] to-transparent" />
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="text-left p-4 text-white/30 font-medium text-xs uppercase tracking-wider">İsim</th>
                    <th className="text-left p-4 text-white/30 font-medium text-xs uppercase tracking-wider hidden sm:table-cell">Faz</th>
                    <th className="text-left p-4 text-white/30 font-medium text-xs uppercase tracking-wider hidden sm:table-cell">Hafta</th>
                    <th className="text-left p-4 text-white/30 font-medium text-xs uppercase tracking-wider">Seri</th>
                    <th className="text-left p-4 text-white/30 font-medium text-xs uppercase tracking-wider hidden md:table-cell">Son Check-in</th>
                    <th className="text-left p-4 text-white/30 font-medium text-xs uppercase tracking-wider">Durum</th>
                    <th className="p-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s, i) => (
                    <motion.tr
                      key={s.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03, duration: 0.3 }}
                      className="border-b border-white/[0.03] hover:bg-white/[0.04] transition-colors duration-200 group"
                    >
                      <td className="p-4 text-white font-medium group-hover:text-[#FF4500] transition-colors">{s.full_name || "—"}</td>
                      <td className="p-4 text-white/40 hidden sm:table-cell">Faz {s.current_phase}</td>
                      <td className="p-4 text-white/40 hidden sm:table-cell">
                        <span className="text-white/60">{s.current_week}</span>
                        <span className="text-white/20">/24</span>
                      </td>
                      <td className="p-4">
                        <span className="flex items-center gap-1.5 text-orange-400">
                          <Flame className="w-3.5 h-3.5" /> {s.streak}
                        </span>
                      </td>
                      <td className="p-4 text-white/40 text-xs hidden md:table-cell">
                        {lastCheckins[s.user_id] ? (
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3 h-3 text-white/20" />
                            {format(new Date(lastCheckins[s.user_id]), "d MMM", { locale: tr })}
                          </span>
                        ) : "—"}
                      </td>
                      <td className="p-4">
                        <Badge className={`${statusStyles[s.status] || ""} border text-xs`}>
                          {statusLabels[s.status] || s.status}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Link
                          to={`/admin/students/${s.user_id}`}
                          className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-white/30 hover:text-[#FF4500] hover:border-[#FF4500]/30 hover:bg-[#FF4500]/5 transition-all duration-200"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 && (
              <div className="text-center py-12">
                <p className="text-white/20">Sonuç bulunamadı</p>
              </div>
            )}
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AdminStudents;
