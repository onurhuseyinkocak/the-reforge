import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { User, Lock, Camera, Flame, CheckCircle2, Trophy, Calendar } from "lucide-react";
import { toast } from "sonner";

const Profile = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [goals, setGoals] = useState(profile?.goals || "");
  const [saving, setSaving] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [changingPw, setChangingPw] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [stats, setStats] = useState({ checkins: 0, tasks: 0, taskTotal: 0 });
  const [achievements, setAchievements] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("checkins").select("id", { count: "exact", head: true }).eq("user_id", user.id).then(({ count }) => {
      setStats(prev => ({ ...prev, checkins: count || 0 }));
    });
    supabase.from("student_tasks").select("status").eq("user_id", user.id).then(({ data }) => {
      setStats(prev => ({ ...prev, taskTotal: data?.length || 0, tasks: data?.filter(t => t.status === "approved").length || 0 }));
    });
    supabase.from("achievements").select("achievement_key").eq("user_id", user.id).then(({ data }) => {
      setAchievements((data || []).map(a => a.achievement_key));
    });
  }, [user]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploadingAvatar(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (error) { toast.error("Yükleme hatası"); setUploadingAvatar(false); return; }
    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
    await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("user_id", user.id);
    setAvatarUrl(publicUrl);
    setUploadingAvatar(false);
    toast.success("Avatar güncellendi!");
    refreshProfile();
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      full_name: fullName.trim(), phone: phone.trim(), bio: bio.trim(), goals: goals.trim(),
    }).eq("user_id", user.id);
    setSaving(false);
    if (error) toast.error("Hata: " + error.message);
    else { toast.success("Profil güncellendi!"); refreshProfile(); }
  };

  const handlePasswordChange = async () => {
    if (newPassword.length < 6) { toast.error("Şifre en az 6 karakter olmalı"); return; }
    setChangingPw(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setChangingPw(false);
    if (error) toast.error(error.message);
    else { toast.success("Şifre güncellendi!"); setNewPassword(""); }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <Card className="bg-card border-border/30 p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative group">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="w-16 h-16 rounded-full object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="w-8 h-8 text-primary" />
              </div>
            )}
            <label className="absolute inset-0 rounded-full bg-background/60 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition">
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              {uploadingAvatar ? <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" /> : <Camera className="w-5 h-5 text-foreground" />}
            </label>
          </div>
          <div>
            <h2 className="font-display text-xl text-foreground">{profile?.full_name || "Kullanıcı"}</h2>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="text-center p-3 rounded-lg bg-secondary/50">
            <Calendar className="w-4 h-4 text-primary mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">{stats.checkins}</p>
            <p className="text-[10px] text-muted-foreground">Check-in</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-secondary/50">
            <CheckCircle2 className="w-4 h-4 text-green-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">{stats.tasks}/{stats.taskTotal}</p>
            <p className="text-[10px] text-muted-foreground">Görev</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-secondary/50">
            <Flame className="w-4 h-4 text-orange-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">{profile?.streak || 0}</p>
            <p className="text-[10px] text-muted-foreground">En Uzun Seri</p>
          </div>
        </div>

        {/* Achievements showcase */}
        {achievements.length > 0 && (
          <div className="mb-6">
            <p className="text-xs text-muted-foreground mb-2">Kazanılan Rozetler</p>
            <div className="flex gap-2 flex-wrap">
              {achievements.map(a => (
                <span key={a} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full flex items-center gap-1">
                  <Trophy className="w-3 h-3" /> {a.replace(/_/g, " ")}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <Label className="text-foreground/80">Ad Soyad</Label>
            <Input value={fullName} onChange={e => setFullName(e.target.value)} className="bg-background border-border/30 text-foreground mt-1" />
          </div>
          <div>
            <Label className="text-foreground/80">Telefon</Label>
            <Input value={phone} onChange={e => setPhone(e.target.value)} className="bg-background border-border/30 text-foreground mt-1" placeholder="+90 555 123 4567" />
          </div>
          <div>
            <Label className="text-foreground/80">Hakkında</Label>
            <Textarea value={bio} onChange={e => setBio(e.target.value)} className="bg-background border-border/30 text-foreground mt-1" rows={3} />
          </div>
          <div>
            <Label className="text-foreground/80">Hedefler</Label>
            <Textarea value={goals} onChange={e => setGoals(e.target.value)} className="bg-background border-border/30 text-foreground mt-1" rows={3} placeholder="Programdan ne elde etmek istiyorsun?" />
          </div>
          <Button onClick={handleSave} disabled={saving} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            {saving ? "Kaydediliyor..." : "Profili Kaydet"}
          </Button>
        </div>
      </Card>

      <Card className="bg-card border-border/30 p-6">
        <h3 className="font-display text-lg text-foreground mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5" /> Şifre Değiştir
        </h3>
        <div className="space-y-4">
          <div>
            <Label className="text-foreground/80">Yeni Şifre</Label>
            <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="bg-background border-border/30 text-foreground mt-1" placeholder="••••••••" />
          </div>
          <Button onClick={handlePasswordChange} disabled={changingPw} variant="outline" className="border-border/30 text-foreground hover:bg-secondary">
            {changingPw ? "Değiştiriliyor..." : "Şifreyi Güncelle"}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Profile;
