import { motion } from "framer-motion";
import { Flame, Award, Calendar, TrendingUp, Star } from "lucide-react";

const MOCK_FORGED = [
  { id: '1', name: 'Kaan Yıldırım', avatar: null, score: 142000, forgedDate: '2026-02-14', guild: 'OBSIDIAN FORGE', weeks: 24 },
  { id: '2', name: 'Emre Demir', avatar: null, score: 128500, forgedDate: '2026-02-21', guild: 'SILENT HAMMERS', weeks: 24 },
  { id: '3', name: 'Burak Çelik', avatar: null, score: 115000, forgedDate: '2026-01-30', guild: 'OBSIDIAN FORGE', weeks: 24 },
  { id: '4', name: 'Arda Koç', avatar: null, score: 108000, forgedDate: '2026-03-01', guild: 'IRON WOLVES', weeks: 24 },
  { id: '5', name: 'Yusuf Kara', avatar: null, score: 103200, forgedDate: '2026-03-10', guild: 'PHOENIX GUARD', weeks: 22 },
];

export default function ForgedWall() {
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
            <span className="flex items-center gap-1.5"><Star size={14} className="text-primary" /> {MOCK_FORGED.length} Forged</span>
            <span className="flex items-center gap-1.5"><Award size={14} /> Tüm zamanlar</span>
          </motion.div>
        </motion.div>
      </div>

      {/* Forged Cards */}
      <div className="space-y-4 max-w-2xl mx-auto">
        {MOCK_FORGED.map((person, i) => (
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
                    <span className="flex items-center gap-1"><Calendar size={11} /> {new Date(person.forgedDate).toLocaleDateString('tr-TR')}</span>
                    <span className="flex items-center gap-1"><TrendingUp size={11} /> {person.score.toLocaleString()} puan</span>
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