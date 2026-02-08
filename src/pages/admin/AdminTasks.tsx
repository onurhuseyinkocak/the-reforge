import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Check, X } from "lucide-react";
import { toast } from "sonner";

const AdminTasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [pendingSubmissions, setPendingSubmissions] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [phase, setPhase] = useState(1);
  const [week, setWeek] = useState(1);
  const [creating, setCreating] = useState(false);

  const fetchData = async () => {
    const { data: t } = await supabase.from("tasks").select("*").order("created_at", { ascending: false });
    setTasks(t || []);
    const { data: s } = await supabase.from("student_tasks").select("*, tasks(*), profiles!student_tasks_user_id_fkey(full_name)")
      .eq("status", "submitted").order("submitted_at", { ascending: false });
    setPendingSubmissions(s || []);
  };

  useEffect(() => { fetchData(); }, []);

  const createTask = async () => {
    if (!title.trim()) { toast.error("Başlık gerekli"); return; }
    setCreating(true);
    const { error } = await supabase.from("tasks").insert({
      title: title.trim(), description: description.trim(), phase, week, created_by: user?.id,
    });
    setCreating(false);
    if (error) toast.error("Hata");
    else { toast.success("Görev oluşturuldu!"); setTitle(""); setDescription(""); fetchData(); }
  };

  const reviewSubmission = async (id: string, approve: boolean, notes?: string) => {
    const { error } = await supabase.from("student_tasks").update({
      status: approve ? "approved" : "rejected",
      reviewed_at: new Date().toISOString(),
      reviewer_notes: notes || (approve ? "Onaylandı ✓" : "Tekrar gönder"),
    }).eq("id", id);
    if (error) toast.error("Hata");
    else { toast.success(approve ? "Onaylandı!" : "Reddedildi"); fetchData(); }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="create">
        <TabsList className="bg-[#0D1B2A] border border-white/10">
          <TabsTrigger value="create" className="data-[state=active]:bg-[#00A3FF]/20 data-[state=active]:text-[#00A3FF]">Görev Oluştur</TabsTrigger>
          <TabsTrigger value="queue" className="data-[state=active]:bg-[#00A3FF]/20 data-[state=active]:text-[#00A3FF]">
            Onay Bekleyen ({pendingSubmissions.length})
          </TabsTrigger>
          <TabsTrigger value="all" className="data-[state=active]:bg-[#00A3FF]/20 data-[state=active]:text-[#00A3FF]">Tüm Görevler</TabsTrigger>
        </TabsList>

        <TabsContent value="create">
          <Card className="bg-[#0D1B2A] border-white/10 p-6 space-y-4">
            <div>
              <Label className="text-[#F0F4F8]/80">Görev Başlığı</Label>
              <Input value={title} onChange={e => setTitle(e.target.value)} className="bg-[#0A1628] border-white/10 text-white mt-1" />
            </div>
            <div>
              <Label className="text-[#F0F4F8]/80">Açıklama</Label>
              <Textarea value={description} onChange={e => setDescription(e.target.value)} className="bg-[#0A1628] border-white/10 text-white mt-1" rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-[#F0F4F8]/80">Faz</Label>
                <Input type="number" min={1} max={3} value={phase} onChange={e => setPhase(Number(e.target.value))} className="bg-[#0A1628] border-white/10 text-white mt-1" />
              </div>
              <div>
                <Label className="text-[#F0F4F8]/80">Hafta</Label>
                <Input type="number" min={1} max={24} value={week} onChange={e => setWeek(Number(e.target.value))} className="bg-[#0A1628] border-white/10 text-white mt-1" />
              </div>
            </div>
            <Button onClick={createTask} disabled={creating} className="bg-[#00A3FF] hover:bg-[#00A3FF]/90 text-white">
              <Plus className="w-4 h-4 mr-2" /> {creating ? "Oluşturuluyor..." : "Görev Oluştur"}
            </Button>
          </Card>
        </TabsContent>

        <TabsContent value="queue">
          {pendingSubmissions.length === 0 ? (
            <Card className="bg-[#0D1B2A] border-white/10 p-8 text-center"><p className="text-[#F0F4F8]/40">Onay bekleyen görev yok</p></Card>
          ) : (
            <div className="space-y-3">
              {pendingSubmissions.map(s => (
                <Card key={s.id} className="bg-[#0D1B2A] border-white/10 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-white font-medium">{s.tasks?.title}</p>
                      <p className="text-sm text-[#F0F4F8]/50">{(s as any).profiles?.full_name || "Öğrenci"}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => reviewSubmission(s.id, true)} className="bg-green-600 hover:bg-green-700 text-white">
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button size="sm" onClick={() => reviewSubmission(s.id, false)} variant="destructive">
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="all">
          <div className="space-y-2">
            {tasks.map(t => (
              <Card key={t.id} className="bg-[#0D1B2A] border-white/10 p-4 flex items-center justify-between">
                <div>
                  <p className="text-white">{t.title}</p>
                  <p className="text-xs text-[#F0F4F8]/40">Faz {t.phase} · Hafta {t.week}</p>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminTasks;
