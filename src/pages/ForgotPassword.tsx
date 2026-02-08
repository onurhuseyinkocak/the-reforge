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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <Flame className="w-8 h-8 text-primary" />
            <span className="font-display text-3xl text-foreground tracking-wider">THE FORGE</span>
          </Link>
          <p className="text-muted-foreground">Şifreni sıfırla</p>
        </div>

        <div className="bg-card border border-border/30 rounded-xl p-6">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                <Flame className="w-6 h-6 text-primary" />
              </div>
              <p className="text-foreground">Şifre sıfırlama linki gönderildi!</p>
              <p className="text-sm text-muted-foreground">Email kutunu kontrol et.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="text-foreground/80">Email</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-background border-border/30 text-foreground mt-1" placeholder="ornek@email.com" />
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                {loading ? "Gönderiliyor..." : "Sıfırlama Linki Gönder"}
              </Button>
            </form>
          )}
        </div>

        <Link to="/login" className="flex items-center justify-center gap-2 mt-4 text-sm text-primary hover:underline">
          <ArrowLeft className="w-4 h-4" /> Giriş sayfasına dön
        </Link>
      </div>
    </div>
  );
};

export default ForgotPassword;
