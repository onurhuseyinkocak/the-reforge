import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { User, Lock, Camera, Flame, CheckCircle2, Trophy, Calendar, Target, Shield, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
};

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

  const taskPercent = stats.taskTotal > 0 ? Math.round((stats.tasks / stats.taskTotal) * 100) : 0;

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="max-w-3xl mx-auto space-y-6 relative"
    >
      {/* Background glow orbs */}
      <div className="fixed top-20 left-1/4 w-[500px] h-[500px] bg-[#FF4500]/[0.03] rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-20 right-1/4 w-[400px] h-[400px] bg-orange-500/[0.02] rounded-full blur-[100px] pointer-events-none" />

      {/* Hero Profile Card */}
      <motion.div variants={item}>
        <div className="relative overflow-hidden rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-xl">
          {/* Top accent line */}
          <div className="h-[2px] bg-gradient-to-r from-transparent via-[#FF4500] to-transparent" />

          {/* Hero banner gradient */}
          <div className="h-32 bg-gradient-to-br from-[#FF4500]/20 via-orange-600/10 to-transparent relative">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIvPjwvc3ZnPg==')] opacity-50" />
          </div>

          <div className="px-6 pb-6 -mt-14">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
              {/* Avatar */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="relative group"
              >
                <div className="w-24 h-24 rounded-2xl overflow-hidden ring-4 ring-black/50 shadow-2xl shadow-[#FF4500]/20">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#FF4500]/30 to-orange-900/30 flex items-center justify-center">
                      <User className="w-10 h-10 text-[#FF4500]" />
                    </div>
                  )}
                </div>
                <label className="absolute inset-0 rounded-2xl bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-all duration-300">
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                  {uploadingAvatar ? (
                    <div className="w-6 h-6 border-2 border-[#FF4500] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Camera className="w-6 h-6 text-white" />
                  )}
                </label>
                {/* Online dot */}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-[3px] border-black" />
              </motion.div>

              {/* Name & Email */}
              <div className="flex-1 pb-1">
                <h2 className="font-display text-3xl text-white tracking-wide">
                  {profile?.full_name || "Kullanıcı"}
                </h2>
                <p className="text-sm text-white/40 mt-0.5">{user?.email}</p>
              </div>

              {/* Phase & Week badges */}
              <div className="flex gap-2 pb-1">
                {profile?.current_phase && (
                  <div className="px-3 py-1.5 rounded-lg bg-[#FF4500]/10 border border-[#FF4500]/20 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-[#FF4500]" />
                    <span className="text-xs font-semibold text-[#FF4500]">Faz {profile.current_phase}</span>
                  </div>
                )}
                {profile?.current_week && (
                  <div className="px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-white/50" />
                    <span className="text-xs font-semibold text-white/60">Hafta {profile.current_week}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={item} className="grid grid-cols-3 gap-4">
        {[
          { icon: Calendar, label: "Check-in", value: stats.checkins, color: "#FF4500", glow: "shadow-[#FF4500]/10" },
          { icon: CheckCircle2, label: "Görev", value: `${stats.tasks}/${stats.taskTotal}`, color: "#22c55e", glow: "shadow-green-500/10", sub: `${taskPercent}%` },
          { icon: Flame, label: "En Uzun Seri", value: profile?.streak || 0, color: "#f97316", glow: "shadow-orange-500/10" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
            className={`relative overflow-hidden rounded-xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-xl p-4 shadow-xl ${stat.glow}`}
          >
            <div className="h-[2px] absolute top-0 left-0 right-0 bg-gradient-to-r from-transparent to-transparent" style={{ backgroundImage: `linear-gradient(to right, transparent, ${stat.color}40, transparent)` }} />
            <div className="flex flex-col items-center text-center gap-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${stat.color}15` }}>
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white tracking-tight">{stat.value}</p>
                {stat.sub && (
                  <div className="w-full bg-white/[0.06] rounded-full h-1.5 mt-1.5 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${taskPercent}%`, background: stat.color }} />
                  </div>
                )}
                <p className="text-[11px] text-white/40 mt-1 uppercase tracking-wider">{stat.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Achievements */}
      {achievements.length > 0 && (
        <motion.div variants={item}>
          <div className="relative overflow-hidden rounded-xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-xl p-5">
            <div className="h-[2px] absolute top-0 left-0 right-0 bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Trophy className="w-4 h-4 text-amber-400" />
              </div>
              <h3 className="font-display text-lg text-white tracking-wide">Kazanilan Rozetler</h3>
              <span className="ml-auto text-xs text-white/30 bg-white/[0.05] px-2 py-0.5 rounded-full">{achievements.length}</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {achievements.map((a, i) => (
                <motion.span
                  key={a}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                  className="text-xs bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-300 border border-amber-500/20 px-3 py-1.5 rounded-lg flex items-center gap-1.5 hover:border-amber-500/40 transition-colors"
                >
                  <Sparkles className="w-3 h-3 text-amber-400" /> {a.replace(/_/g, " ")}
                </motion.span>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Profile Edit Form */}
      <motion.div variants={item}>
        <div className="relative overflow-hidden rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-xl">
          <div className="h-[2px] bg-gradient-to-r from-transparent via-[#FF4500]/50 to-transparent" />
          <div className="p-6 space-y-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-[#FF4500]/10 flex items-center justify-center">
                <User className="w-4.5 h-4.5 text-[#FF4500]" />
              </div>
              <h3 className="font-display text-xl text-white tracking-wide">Profil Bilgileri</h3>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="text-white/50 text-xs uppercase tracking-wider">Ad Soyad</Label>
                <Input
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 focus:border-[#FF4500]/50 focus:ring-[#FF4500]/20 h-11 rounded-xl transition-colors"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white/50 text-xs uppercase tracking-wider">Telefon</Label>
                <Input
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 focus:border-[#FF4500]/50 focus:ring-[#FF4500]/20 h-11 rounded-xl transition-colors"
                  placeholder="+90 555 123 4567"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-white/50 text-xs uppercase tracking-wider">Hakkinda</Label>
              <Textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                className="bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 focus:border-[#FF4500]/50 focus:ring-[#FF4500]/20 rounded-xl transition-colors resize-none"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white/50 text-xs uppercase tracking-wider flex items-center gap-2">
                <Target className="w-3.5 h-3.5 text-[#FF4500]" /> Hedefler
              </Label>
              <Textarea
                value={goals}
                onChange={e => setGoals(e.target.value)}
                className="bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 focus:border-[#FF4500]/50 focus:ring-[#FF4500]/20 rounded-xl transition-colors resize-none"
                rows={3}
                placeholder="Programdan ne elde etmek istiyorsun?"
              />
            </div>

            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="w-full h-12 bg-gradient-to-r from-[#FF4500] to-orange-600 hover:from-[#FF4500]/90 hover:to-orange-600/90 text-white font-semibold rounded-xl shadow-lg shadow-[#FF4500]/20 transition-all duration-300 border-0"
              >
                {saving ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Kaydediliyor...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Profili Kaydet
                  </div>
                )}
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Password Change */}
      <motion.div variants={item}>
        <div className="relative overflow-hidden rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-xl">
          <div className="h-[2px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <div className="p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/[0.06] flex items-center justify-center">
                <Lock className="w-4.5 h-4.5 text-white/50" />
              </div>
              <h3 className="font-display text-xl text-white tracking-wide">Sifre Degistir</h3>
            </div>

            <div className="space-y-2">
              <Label className="text-white/50 text-xs uppercase tracking-wider">Yeni Sifre</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 focus:border-white/20 h-11 rounded-xl transition-colors"
                placeholder="••••••••"
              />
            </div>

            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
              <Button
                onClick={handlePasswordChange}
                disabled={changingPw}
                variant="outline"
                className="h-11 bg-white/[0.04] border-white/[0.08] text-white hover:bg-white/[0.08] hover:border-white/[0.12] rounded-xl transition-all duration-300"
              >
                {changingPw ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Değiştiriliyor...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Şifreyi Güncelle
                  </div>
                )}
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Profile;
