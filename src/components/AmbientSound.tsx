import { useState, useEffect, useRef, useCallback } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Medieval forge ambient sounds - Mixkit CDN (working URLs)
const AUDIO_SOURCES = [
  // Campfire crackles (24 sec loop) - perfect for forge ambience
  "https://assets.mixkit.co/active_storage/sfx/1330/1330-preview.mp3",
  // Campfire night wind (30 sec) - with crackling and wind
  "https://assets.mixkit.co/active_storage/sfx/1736/1736-preview.mp3",
  // SoundBible crackling fireplace (fallback)
  "https://soundbible.com/grab.php?id=2178&type=mp3",
];

const AmbientSound = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const [audioLoaded, setAudioLoaded] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentSourceIndex = useRef(0);

  // Try to load audio from available sources
  const loadAudio = useCallback(() => {
    if (currentSourceIndex.current >= AUDIO_SOURCES.length) {
      console.warn("All audio sources failed to load");
      return;
    }

    const audio = new Audio();
    audio.loop = true;
    audio.volume = 0.15;
    audio.preload = "auto";
    audio.crossOrigin = "anonymous";

    audio.addEventListener("canplaythrough", () => {
      setAudioLoaded(true);
      audioRef.current = audio;
    });

    audio.addEventListener("error", () => {
      console.warn(`Audio source ${currentSourceIndex.current} failed, trying next...`);
      currentSourceIndex.current++;
      loadAudio();
    });

    audio.src = AUDIO_SOURCES[currentSourceIndex.current];
    audio.load();
  }, []);

  // Initialize audio on mount
  useEffect(() => {
    loadAudio();

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [loadAudio]);

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
    if (!audio || !audioLoaded) {
      console.log("Audio not ready yet");
      return;
    }

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
      }).catch((err) => {
        console.error("Audio play failed:", err);
      });
    }
  }, [isPlaying, hasInteracted, fadeAudio, audioLoaded]);

  // Auto-start on first scroll/click (only if audio is loaded)
  useEffect(() => {
    if (!audioLoaded) return;

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
  }, [hasInteracted, fadeAudio, audioLoaded]);

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
