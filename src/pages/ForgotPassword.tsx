import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Flame, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const ForgotPassword = () => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { toast.error("Email girin"); return; }
    setLoading(true);
    const { error } = await resetPassword(email);
    setLoading(false);
    if (error) toast.error(error.message);
    else setSent(true);
  };

  return (
    <div className="min-h-screen bg-[#0A1628] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <Flame className="w-8 h-8 text-[#00A3FF]" />
            <span className="font-display text-3xl text-white tracking-wider">THE FORGE</span>
          </Link>
          <p className="text-[#F0F4F8]/60">Şifreni sıfırla</p>
        </div>

        <div className="bg-[#0D1B2A] border border-white/10 rounded-xl p-6">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-[#00A3FF]/20 rounded-full flex items-center justify-center mx-auto">
                <Flame className="w-6 h-6 text-[#00A3FF]" />
              </div>
              <p className="text-white">Şifre sıfırlama linki gönderildi!</p>
              <p className="text-sm text-[#F0F4F8]/50">Email kutunu kontrol et.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="text-[#F0F4F8]/80">Email</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-[#0A1628] border-white/10 text-white mt-1" placeholder="ornek@email.com" />
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-[#00A3FF] hover:bg-[#00A3FF]/90 text-white">
                {loading ? "Gönderiliyor..." : "Sıfırlama Linki Gönder"}
              </Button>
            </form>
          )}
        </div>

        <Link to="/login" className="flex items-center justify-center gap-2 mt-4 text-sm text-[#00A3FF] hover:underline">
          <ArrowLeft className="w-4 h-4" /> Giriş sayfasına dön
        </Link>
      </div>
    </div>
  );
};

export default ForgotPassword;
