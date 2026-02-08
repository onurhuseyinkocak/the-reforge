import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Flame } from "lucide-react";

const ApplicationSubmitted = () => (
  <div className="min-h-screen bg-background flex items-center justify-center p-4">
    <Card className="bg-card border-border/30 p-8 max-w-md text-center space-y-6">
      <div className="flex justify-center">
        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-primary" />
        </div>
      </div>
      <div className="flex items-center gap-2 justify-center">
        <Flame className="w-6 h-6 text-primary" />
        <span className="font-display text-2xl text-foreground tracking-widest">THE FORGE</span>
      </div>
      <h2 className="font-display text-3xl text-foreground">Başvurun Alındı!</h2>
      <p className="text-muted-foreground">
        Başvurun incelemeye alındı. Onaylandığında e-posta adresine şifre oluşturma linki gönderilecek.
        Bu süreç genellikle 24-48 saat içinde tamamlanır.
      </p>
      <Link to="/">
        <Button variant="outline" className="border-border/30 text-foreground">Ana Sayfaya Dön</Button>
      </Link>
    </Card>
  </div>
);

export default ApplicationSubmitted;
