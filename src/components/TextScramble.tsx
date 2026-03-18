import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";

const chars = "ABCDEFGHİJKLMNOPRSTUVYZ0123456789!@#$%&";

interface TextScrambleProps {
  text: string;
  className?: string;
  delay?: number;
  speed?: number;
}

const TextScramble = ({ text, className = "", delay = 0, speed = 30 }: TextScrambleProps) => {
  const [displayText, setDisplayText] = useState(text.replace(/[^\s]/g, " "));
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (!isInView || hasStarted) return;

    const timeout = setTimeout(() => {
      setHasStarted(true);
      let iteration = 0;
      const maxIterations = text.length * 3;

      const interval = setInterval(() => {
        setDisplayText(
          text
            .split("")
            .map((char, index) => {
              if (char === " ") return " ";
              if (index < iteration / 3) return text[index];
              return chars[Math.floor(Math.random() * chars.length)];
            })
            .join("")
        );

        iteration++;
        if (iteration >= maxIterations) {
          clearInterval(interval);
          setDisplayText(text);
        }
      }, speed);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timeout);
  }, [isInView, text, delay, speed, hasStarted]);

  return (
    <motion.span
      ref={ref}
      className={className}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : {}}
      transition={{ duration: 0.3, delay: delay / 1000 }}
    >
      {displayText}
    </motion.span>
  );
};

export default TextScramble;
