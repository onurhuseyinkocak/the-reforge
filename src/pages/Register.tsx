import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Flame, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const schema = z.object({
  fullName: z.string().trim().min(2, "İsim en az 2 karakter olmalı"),
  email: z.string().trim().email("Geçerli bir email girin"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalı"),
});

const Register = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ fullName, email, password });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setLoading(true);
    const { error } = await signUp(email, password, fullName);
    setLoading(false);
    if (error) {
      if (error.message?.includes("already registered")) {
        toast.error("Bu email zaten kayıtlı");
      } else {
        toast.error(error.message);
      }
    } else {
      toast.success("Kayıt başarılı!");
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <Flame className="w-8 h-8 text-primary" />
            <span className="font-display text-3xl text-foreground tracking-wider">THE FORGE</span>
          </Link>
          <p className="text-muted-foreground">Yeni hesap oluştur</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card border border-border/30 rounded-xl p-6 space-y-4">
          <div>
            <Label className="text-foreground/80">Ad Soyad</Label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="bg-background border-border/30 text-foreground mt-1" placeholder="Ahmet Yılmaz" />
          </div>
          <div>
            <Label className="text-foreground/80">Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-background border-border/30 text-foreground mt-1" placeholder="ornek@email.com" />
          </div>
          <div>
            <Label className="text-foreground/80">Şifre</Label>
            <div className="relative mt-1">
              <Input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="bg-background border-border/30 text-foreground pr-10" placeholder="••••••••" />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium">
            {loading ? "Kayıt yapılıyor..." : "Kayıt Ol"}
          </Button>
        </form>

        <p className="text-center mt-4 text-sm text-muted-foreground">
          Zaten hesabın var mı?{" "}
          <Link to="/login" className="text-primary hover:underline">Giriş yap</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
