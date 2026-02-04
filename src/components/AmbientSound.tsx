import { useState, useEffect, useRef, useCallback } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const AmbientSound = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio
  useEffect(() => {
    const audio = new Audio(
      "https://cdn.freesound.org/previews/507/507891_3162170-lq.mp3"
    );
    audio.loop = true;
    audio.volume = 0.15; // Low volume for ambience
    audio.preload = "auto";
    audioRef.current = audio;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Fade in/out audio
  const fadeAudio = useCallback((fadeIn: boolean) => {
    const audio = audioRef.current;
    if (!audio) return;

    const targetVolume = fadeIn ? 0.15 : 0;
    const step = fadeIn ? 0.01 : -0.01;
    const interval = setInterval(() => {
      if (fadeIn && audio.volume < targetVolume) {
        audio.volume = Math.min(audio.volume + step, targetVolume);
      } else if (!fadeIn && audio.volume > targetVolume) {
        audio.volume = Math.max(audio.volume + step, targetVolume);
      } else {
        clearInterval(interval);
        if (!fadeIn) audio.pause();
      }
    }, 50);
  }, []);

  // Handle play/pause
  const toggleSound = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!hasInteracted) {
      setHasInteracted(true);
      setShowHint(false);
    }

    if (isPlaying) {
      fadeAudio(false);
      setIsPlaying(false);
    } else {
      audio.volume = 0;
      audio.play().then(() => {
        fadeAudio(true);
        setIsPlaying(true);
      }).catch(console.error);
    }
  }, [isPlaying, hasInteracted, fadeAudio]);

  // Auto-start on first scroll/click
  useEffect(() => {
    const handleFirstInteraction = () => {
      if (!hasInteracted && audioRef.current) {
        setHasInteracted(true);
        setShowHint(false);
        audioRef.current.volume = 0;
        audioRef.current.play().then(() => {
          fadeAudio(true);
          setIsPlaying(true);
        }).catch(() => {
          // Autoplay blocked, user will need to click
        });
      }
    };

    const events = ["scroll", "click", "touchstart"];
    events.forEach(event => 
      window.addEventListener(event, handleFirstInteraction, { once: true, passive: true })
    );

    // Hide hint after 5 seconds
    const hintTimer = setTimeout(() => setShowHint(false), 5000);

    return () => {
      events.forEach(event => 
        window.removeEventListener(event, handleFirstInteraction)
      );
      clearTimeout(hintTimer);
    };
  }, [hasInteracted, fadeAudio]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
      {/* Hint tooltip */}
      <AnimatePresence>
        {showHint && !hasInteracted && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="bg-card/90 backdrop-blur-sm px-3 py-2 rounded-lg border border-border/50 text-sm text-muted-foreground"
          >
            🔥 Atmosfer için sesi aç
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sound toggle button */}
      <motion.button
        onClick={toggleSound}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className={`
          p-3 rounded-full backdrop-blur-sm border transition-all duration-300
          ${isPlaying 
            ? "bg-primary/20 border-primary/50 text-primary shadow-[0_0_20px_rgba(255,69,0,0.3)]" 
            : "bg-card/80 border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/30"
          }
        `}
        aria-label={isPlaying ? "Sesi kapat" : "Sesi aç"}
      >
        {isPlaying ? (
          <Volume2 className="w-5 h-5" />
        ) : (
          <VolumeX className="w-5 h-5" />
        )}
      </motion.button>
    </div>
  );
};

export default AmbientSound;
