import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Search, ChevronRight, Flame, Calendar } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

const statusStyles: Record<string, string> = {
  active: "bg-green-500/20 text-green-400",
  "at-risk": "bg-orange-500/20 text-orange-400",
  inactive: "bg-red-500/20 text-red-400",
  completed: "bg-primary/20 text-primary",
};

const statusLabels: Record<string, string> = {
  active: "Aktif", "at-risk": "Risk", inactive: "Pasif", completed: "Tamamladı",
};

const AdminStudents = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [lastCheckins, setLastCheckins] = useState<Record<string, string>>({});

  useEffect(() => {
    supabase.from("profiles").select("*").order("created_at", { ascending: false }).then(({ data }) => setStudents(data || []));
    // Fetch last check-in per student
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

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="İsim ara..." className="bg-card border-border/30 text-foreground pl-10" />
        </div>
        <div className="flex gap-2">
          {["all", "active", "at-risk", "inactive"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${filter === f ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}>
              {f === "all" ? "Tümü" : statusLabels[f]}
            </button>
          ))}
        </div>
      </div>

      <Card className="bg-card border-border/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/30">
                <th className="text-left p-3 text-muted-foreground font-medium">İsim</th>
                <th className="text-left p-3 text-muted-foreground font-medium hidden sm:table-cell">Faz</th>
                <th className="text-left p-3 text-muted-foreground font-medium hidden sm:table-cell">Hafta</th>
                <th className="text-left p-3 text-muted-foreground font-medium">Seri 🔥</th>
                <th className="text-left p-3 text-muted-foreground font-medium hidden md:table-cell">Son Check-in</th>
                <th className="text-left p-3 text-muted-foreground font-medium">Durum</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id} className="border-b border-border/10 hover:bg-secondary transition">
                  <td className="p-3 text-foreground font-medium">{s.full_name || "—"}</td>
                  <td className="p-3 text-muted-foreground hidden sm:table-cell">Faz {s.current_phase}</td>
                  <td className="p-3 text-muted-foreground hidden sm:table-cell">{s.current_week}/24</td>
                  <td className="p-3">
                    <span className="flex items-center gap-1 text-orange-400">
                      <Flame className="w-3 h-3" /> {s.streak}
                    </span>
                  </td>
                  <td className="p-3 text-muted-foreground text-xs hidden md:table-cell">
                    {lastCheckins[s.user_id] ? (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(lastCheckins[s.user_id]), "d MMM", { locale: tr })}
                      </span>
                    ) : "—"}
                  </td>
                  <td className="p-3"><Badge className={statusStyles[s.status] || ""}>{statusLabels[s.status] || s.status}</Badge></td>
                  <td className="p-3">
                    <Link to={`/admin/students/${s.user_id}`} className="text-primary hover:text-primary/80">
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <p className="text-center py-8 text-muted-foreground">Sonuç bulunamadı</p>}
      </Card>
    </div>
  );
};

export default AdminStudents;
