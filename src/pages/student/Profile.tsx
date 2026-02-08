import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { User, Lock } from "lucide-react";
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

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      full_name: fullName.trim(),
      phone: phone.trim(),
      bio: bio.trim(),
      goals: goals.trim(),
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
      {/* Avatar & Info */}
      <Card className="bg-[#0D1B2A] border-white/10 p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-[#00A3FF]/20 flex items-center justify-center">
            <User className="w-8 h-8 text-[#00A3FF]" />
          </div>
          <div>
            <h2 className="font-display text-xl text-white">{profile?.full_name || "Kullanıcı"}</h2>
            <p className="text-sm text-[#F0F4F8]/50">{user?.email}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-[#F0F4F8]/80">Ad Soyad</Label>
            <Input value={fullName} onChange={e => setFullName(e.target.value)} className="bg-[#0A1628] border-white/10 text-white mt-1" />
          </div>
          <div>
            <Label className="text-[#F0F4F8]/80">Telefon</Label>
            <Input value={phone} onChange={e => setPhone(e.target.value)} className="bg-[#0A1628] border-white/10 text-white mt-1" placeholder="+90 555 123 4567" />
          </div>
          <div>
            <Label className="text-[#F0F4F8]/80">Hakkında</Label>
            <Textarea value={bio} onChange={e => setBio(e.target.value)} className="bg-[#0A1628] border-white/10 text-white mt-1" rows={3} />
          </div>
          <div>
            <Label className="text-[#F0F4F8]/80">Hedefler</Label>
            <Textarea value={goals} onChange={e => setGoals(e.target.value)} className="bg-[#0A1628] border-white/10 text-white mt-1" rows={3} placeholder="Programdan ne elde etmek istiyorsun?" />
          </div>
          <Button onClick={handleSave} disabled={saving} className="bg-[#00A3FF] hover:bg-[#00A3FF]/90 text-white">
            {saving ? "Kaydediliyor..." : "Profili Kaydet"}
          </Button>
        </div>
      </Card>

      {/* Password Change */}
      <Card className="bg-[#0D1B2A] border-white/10 p-6">
        <h3 className="font-display text-lg text-white mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5" /> Şifre Değiştir
        </h3>
        <div className="space-y-4">
          <div>
            <Label className="text-[#F0F4F8]/80">Yeni Şifre</Label>
            <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="bg-[#0A1628] border-white/10 text-white mt-1" placeholder="••••••••" />
          </div>
          <Button onClick={handlePasswordChange} disabled={changingPw} variant="outline" className="border-white/10 text-white hover:bg-white/10">
            {changingPw ? "Değiştiriliyor..." : "Şifreyi Güncelle"}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Profile;
