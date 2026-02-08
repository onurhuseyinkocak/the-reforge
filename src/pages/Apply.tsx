import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Flame, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";

const LIFE_AREAS = [
  { key: "physical", label: "Fiziksel Sağlık", desc: "Vücut, fitness, beslenme" },
  { key: "mental", label: "Zihinsel Sağlık", desc: "Odak, disiplin, ruh hali" },
  { key: "style", label: "Stil & Görünüm", desc: "Giyim, bakım, duruş" },
  { key: "environment", label: "Çevre & Düzen", desc: "Oda, dijital düzen" },
  { key: "social", label: "Sosyal & İlişkiler", desc: "Arkadaşlık, sınırlar" },
  { key: "career", label: "Kariyer & Üretkenlik", desc: "İş, hedefler" },
  { key: "finance", label: "Finansal Bilinç", desc: "Birikim, harcama" },
];

const COMMITMENT_QUESTIONS = [
  "Neden THE FORGE programına katılmak istiyorsun?",
  "Hayatında en çok değiştirmek istediğin şey ne?",
  "24 hafta boyunca günlük disipline hazır mısın? Neden?",
];

const Apply = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState("");

  const [ratings, setRatings] = useState<Record<string, number>>(
    Object.fromEntries(LIFE_AREAS.map(a => [a.key, 5]))
  );

  const [answers, setAnswers] = useState<string[]>(COMMITMENT_QUESTIONS.map(() => ""));

  const handleSubmit = async () => {
    if (answers.some(a => a.trim().length < 10)) {
      toast.error("Lütfen tüm soruları en az 10 karakter ile cevaplayın");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("applications").insert({
      full_name: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      age: parseInt(age),
      situation_ratings: ratings,
      commitment_answers: COMMITMENT_QUESTIONS.map((q, i) => ({ question: q, answer: answers[i] })),
    });
    setLoading(false);
    if (error) {
      toast.error("Başvuru gönderilemedi: " + error.message);
    } else {
      navigate("/application-submitted");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <Link to="/" className="flex items-center gap-2 justify-center mb-8">
          <Flame className="w-8 h-8 text-primary" />
          <span className="font-display text-3xl text-foreground tracking-widest">THE FORGE</span>
        </Link>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                s === step ? "bg-primary text-primary-foreground" : s < step ? "bg-primary/30 text-primary" : "bg-secondary text-muted-foreground"
              }`}>
                {s < step ? <CheckCircle2 className="w-4 h-4" /> : s}
              </div>
              {s < 3 && <div className={`w-12 h-0.5 ${s < step ? "bg-primary/50" : "bg-secondary"}`} />}
            </div>
          ))}
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <Card className="bg-card border-border/30 p-6 space-y-4">
            <h2 className="font-display text-2xl text-foreground">Temel Bilgiler</h2>
            <p className="text-sm text-muted-foreground">Seni tanımamız için gerekli bilgiler.</p>
            <div>
              <Label className="text-foreground/80">Ad Soyad</Label>
              <Input value={fullName} onChange={e => setFullName(e.target.value)} className="bg-background border-border/30 text-foreground mt-1" placeholder="Adın Soyadın" />
            </div>
            <div>
              <Label className="text-foreground/80">E-posta</Label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} className="bg-background border-border/30 text-foreground mt-1" placeholder="email@ornek.com" />
            </div>
            <div>
              <Label className="text-foreground/80">Telefon</Label>
              <Input value={phone} onChange={e => setPhone(e.target.value)} className="bg-background border-border/30 text-foreground mt-1" placeholder="05XX XXX XX XX" />
            </div>
            <div>
              <Label className="text-foreground/80">Yaş</Label>
              <Input type="number" value={age} onChange={e => setAge(e.target.value)} className="bg-background border-border/30 text-foreground mt-1 w-24" placeholder="25" />
            </div>
            <Button 
              onClick={() => {
                if (!fullName.trim() || !email.trim() || !age) {
                  toast.error("Lütfen zorunlu alanları doldurun");
                  return;
                }
                setStep(2);
              }}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Devam Et <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Card>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <Card className="bg-card border-border/30 p-6 space-y-4">
            <h2 className="font-display text-2xl text-foreground">Mevcut Durum</h2>
            <p className="text-sm text-muted-foreground">Her alanı 1-10 arasında değerlendir. 1 = çok kötü, 10 = mükemmel</p>
            {LIFE_AREAS.map(area => (
              <div key={area.key}>
                <div className="flex justify-between mb-1">
                  <Label className="text-foreground/80">{area.label}</Label>
                  <span className="text-primary font-bold text-sm">{ratings[area.key]}/10</span>
                </div>
                <p className="text-xs text-muted-foreground mb-1">{area.desc}</p>
                <input type="range" min={1} max={10} value={ratings[area.key]}
                  onChange={e => setRatings(r => ({ ...r, [area.key]: Number(e.target.value) }))}
                  className="w-full h-2 bg-secondary rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary" />
              </div>
            ))}
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1 border-border/30 text-foreground">
                <ArrowLeft className="w-4 h-4 mr-2" /> Geri
              </Button>
              <Button onClick={() => setStep(3)} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
                Devam Et <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Card>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <Card className="bg-card border-border/30 p-6 space-y-4">
            <h2 className="font-display text-2xl text-foreground">Kararlılık</h2>
            <p className="text-sm text-muted-foreground">Bu sorular motivasyonunu anlamamız için önemli.</p>
            {COMMITMENT_QUESTIONS.map((q, i) => (
              <div key={i}>
                <Label className="text-foreground/80">{q}</Label>
                <Textarea value={answers[i]} onChange={e => { const a = [...answers]; a[i] = e.target.value; setAnswers(a); }}
                  className="bg-background border-border/30 text-foreground mt-1" rows={3} placeholder="Cevabını yaz..." />
              </div>
            ))}
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1 border-border/30 text-foreground">
                <ArrowLeft className="w-4 h-4 mr-2" /> Geri
              </Button>
              <Button onClick={handleSubmit} disabled={loading} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
                {loading ? "Gönderiliyor..." : "Başvuruyu Gönder"}
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Apply;
