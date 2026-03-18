import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Flame, Award, Calendar, TrendingUp, Star, Loader2, Swords } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ForgedPerson {
  id: string;
  name: string;
  avatar_url: string | null;
  score: number;
  forgedDate: string;
  guild: string;
  weeks: number;
}

export default function ForgedWall() {
  const [forged, setForged] = useState<ForgedPerson[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchForged = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .or('current_week.eq.24,and(current_phase.gte.3,current_week.gte.8)')
          .order('streak', { ascending: false });

        if (error) throw error;

        const mapped: ForgedPerson[] = (data || []).map((p: any) => ({
          id: p.id || p.user_id,
          name: p.full_name || 'Anonim',
          avatar_url: p.avatar_url || null,
          score: p.streak || 0,
          forgedDate: p.updated_at || p.created_at || '',
          guild: '-',
          weeks: p.current_week || 24,
        }));

        setForged(mapped);
      } catch (err: any) {
        console.error('Error fetching forged profiles:', err);
        toast({ title: 'Hata', description: 'Forged verileri yüklenirken bir hata oluştu.', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    fetchForged();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 size={32} className="text-primary animate-spin" />
          <p className="text-muted-foreground text-sm">Forged duvarı yükleniyor...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Epic Hero */}
      <div className="relative overflow-hidden mb-12">
        {/* Background glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/8 rounded-full blur-[150px]" />
        <div className="absolute top-20 left-1/4 w-64 h-64 bg-amber-500/5 rounded-full blur-[100px]" />
        <div className="absolute top-10 right-1/4 w-48 h-48 bg-red-500/5 rounded-full blur-[80px]" />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2 }}
          className="relative text-center pt-8 pb-12"
        >
          {/* Animated fire icon */}
          <motion.div
            className="mx-auto mb-6 relative"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="relative">
              <motion.div
                className="absolute inset-0 blur-2xl"
                style={{ background: 'radial-gradient(circle, rgba(255,69,0,0.4), transparent 70%)' }}
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <Flame size={64} className="text-primary relative z-10" strokeWidth={1} fill="rgba(255,69,0,0.3)" />
            </div>
          </motion.div>

          <motion.h1
            className="font-display text-6xl md:text-7xl tracking-[0.2em] text-foreground mb-4"
            initial={{ opacity: 0, y: 30, letterSpacing: '0.5em' }}
            animate={{ opacity: 1, y: 0, letterSpacing: '0.2em' }}
            transition={{ delay: 0.3, duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            FORGED
          </motion.h1>

          <motion.div
            initial={{ width: 0 }}
            animate={{ width: 120 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="h-[2px] mx-auto mb-4"
            style={{ background: 'linear-gradient(90deg, transparent, #FF4500, transparent)' }}
          />

          <motion.p
            className="text-muted-foreground max-w-md mx-auto text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            Ateşten geçenler. 24 haftayı tamamlayıp dönüşümü kanıtlayanlar.
            Bu duvar onların onuruna.
          </motion.p>

          <motion.div
            className="mt-6 flex items-center justify-center gap-6 text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            <span className="flex items-center gap-1.5"><Star size={14} className="text-primary" /> {forged.length} Forged</span>
            <span className="flex items-center gap-1.5"><Award size={14} /> Tüm zamanlar</span>
          </motion.div>
        </motion.div>
      </div>

      {/* Forged Cards or Empty State */}
      {forged.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-center py-16 max-w-md mx-auto"
        >
          <motion.div
            animate={{ scale: [1, 1.05, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="mx-auto mb-6"
          >
            <Swords size={56} className="mx-auto text-primary/40" strokeWidth={1} />
          </motion.div>
          <h2 className="font-display text-2xl tracking-wider text-foreground mb-3">
            Henüz kimse Forged olmadı.
          </h2>
          <p className="text-muted-foreground text-sm mb-2">
            24 haftayı tamamlayıp dönüşümünü kanıtlayan ilk kişi sen ol.
          </p>
          <p className="text-primary font-semibold text-sm italic">
            "İlk sen ol."
          </p>
        </motion.div>
      ) : (
        <div className="space-y-4 max-w-2xl mx-auto">
          {forged.map((person, i) => (
            <motion.div
              key={person.id}
              initial={{ opacity: 0, y: 30, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.12, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
              whileHover={{ y: -2, transition: { duration: 0.2 } }}
              className="group relative"
            >
              {/* Hover glow */}
              <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-primary/20 via-amber-500/10 to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-[1px]" />

              <div className="relative rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl overflow-hidden">
                {/* Top accent */}
                <div className="h-[2px]" style={{ background: 'linear-gradient(90deg, transparent, #FF4500, #FFD700, #FF4500, transparent)' }} />

                <div className="p-6 flex items-center gap-5">
                  {/* Rank + Avatar */}
                  <div className="relative">
                    <div className="text-[10px] font-mono text-muted-foreground/50 text-center mb-1">#{i + 1}</div>
                    <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-primary/20 to-amber-500/10 border border-primary/30 flex items-center justify-center relative overflow-hidden">
                      <span className="font-display text-xl text-primary">{person.name.split(' ').map(n => n[0]).join('')}</span>
                      {/* Fire border animation for #1 */}
                      {i === 0 && (
                        <motion.div
                          className="absolute inset-0 rounded-xl"
                          animate={{ boxShadow: ['inset 0 0 10px rgba(255,69,0,0)', 'inset 0 0 20px rgba(255,69,0,0.3)', 'inset 0 0 10px rgba(255,69,0,0)'] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      )}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-display text-xl tracking-wider">{person.name}</h3>
                      <motion.span
                        className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/20 text-primary border border-primary/30"
                        animate={{ boxShadow: ['0 0 0px rgba(255,69,0,0)', '0 0 10px rgba(255,69,0,0.2)', '0 0 0px rgba(255,69,0,0)'] }}
                        transition={{ duration: 3, repeat: Infinity }}
                      >
                        FORGED
                      </motion.span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{person.guild}</span>
                      {person.forgedDate && (
                        <span className="flex items-center gap-1"><Calendar size={11} /> {new Date(person.forgedDate).toLocaleDateString('tr-TR')}</span>
                      )}
                      <span className="flex items-center gap-1"><TrendingUp size={11} /> {person.score.toLocaleString()} streak</span>
                      <span>{person.weeks} hafta</span>
                    </div>
                  </div>

                  {/* Flame icon */}
                  <motion.div
                    animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                  >
                    <Flame size={28} className="text-primary" fill="rgba(255,69,0,0.2)" />
                  </motion.div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Bottom motivational text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="text-center mt-16"
      >
        <p className="text-muted-foreground/40 text-sm italic">
          "You are not just trained. You are FORGED."
        </p>
      </motion.div>
    </div>
  );
}
