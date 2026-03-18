import type { Variants } from "framer-motion";

/** Standard fade-up item used inside a stagger container */
export const fadeUpItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 180, damping: 22 } },
  visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 180, damping: 22 } },
};

/** Stagger container */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
