import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

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
    const { error } = await supabase.from("applications").update({
      status, reviewed_by: user?.id, reviewed_at: new Date().toISOString(),
    }).eq("id", id);
    if (error) toast.error("Hata: " + error.message);
    else {
      toast.success(status === "approved" ? "Başvuru onaylandı ✅" : "Başvuru reddedildi");
      fetchApps();
    }
  };

  const statusBadge = (s: string) => {
    if (s === "approved") return <Badge className="bg-green-500/20 text-green-400">Onaylandı</Badge>;
    if (s === "rejected") return <Badge className="bg-destructive/20 text-destructive">Reddedildi</Badge>;
    return <Badge className="bg-primary/20 text-primary">Bekliyor</Badge>;
  };

  if (loading) return <p className="text-muted-foreground">Yükleniyor...</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl text-foreground">Başvurular</h2>
        <span className="text-sm text-muted-foreground">{applications.filter(a => a.status === "pending").length} bekliyor</span>
      </div>

      {applications.map(app => (
        <Card key={app.id} className="bg-card border-border/30 p-4">
          <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpandedId(expandedId === app.id ? null : app.id)}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                {app.full_name?.charAt(0)?.toUpperCase()}
              </div>
              <div>
                <p className="text-foreground font-medium">{app.full_name}</p>
                <p className="text-xs text-muted-foreground">{app.email} • {format(new Date(app.created_at), "d MMM yyyy", { locale: tr })}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {statusBadge(app.status)}
              {expandedId === app.id ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </div>
          </div>

          {expandedId === app.id && (
            <div className="mt-4 space-y-4 border-t border-border/30 pt-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">Telefon:</span> <span className="text-foreground ml-1">{app.phone || "—"}</span></div>
                <div><span className="text-muted-foreground">Yaş:</span> <span className="text-foreground ml-1">{app.age || "—"}</span></div>
              </div>

              {app.situation_ratings && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Durum Değerlendirmesi:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(app.situation_ratings as Record<string, number>).map(([key, val]) => (
                      <div key={key} className="flex items-center justify-between bg-secondary p-2 rounded text-sm">
                        <span className="text-foreground/80 capitalize">{key}</span>
                        <span className={`font-bold ${val >= 7 ? "text-green-400" : val >= 4 ? "text-primary" : "text-destructive"}`}>{val}/10</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {app.commitment_answers && Array.isArray(app.commitment_answers) && (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">Kararlılık Cevapları:</p>
                  {(app.commitment_answers as any[]).map((qa: any, i: number) => (
                    <div key={i} className="bg-secondary p-3 rounded">
                      <p className="text-xs text-muted-foreground mb-1">{qa.question}</p>
                      <p className="text-sm text-foreground">{qa.answer}</p>
                    </div>
                  ))}
                </div>
              )}

              {app.status === "pending" && (
                <div className="flex gap-3">
                  <Button onClick={() => handleAction(app.id, "approved")} className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                    <CheckCircle2 className="w-4 h-4 mr-2" /> Onayla
                  </Button>
                  <Button onClick={() => handleAction(app.id, "rejected")} variant="outline" className="flex-1 border-destructive/30 text-destructive hover:bg-destructive/10">
                    <XCircle className="w-4 h-4 mr-2" /> Reddet
                  </Button>
                </div>
              )}
            </div>
          )}
        </Card>
      ))}

      {applications.length === 0 && (
        <Card className="bg-card border-border/30 p-8 text-center">
          <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">Henüz başvuru yok</p>
        </Card>
      )}
    </div>
  );
};

export default AdminApplications;
