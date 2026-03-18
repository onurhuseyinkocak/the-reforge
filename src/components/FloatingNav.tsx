import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { useState } from "react";
import { Link } from "react-router-dom";

const navLinks = [
  { label: "Manifesto", href: "#manifesto" },
  { label: "Program", href: "#program" },
  { label: "Kardeşlik", href: "#brotherhood" },
  { label: "Dönüşümler", href: "#testimonials" },
];

const FloatingNav = () => {
  const [visible, setVisible] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setVisible(latest > 100);
  });

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.nav
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="fixed top-0 left-0 right-0 z-50"
        >
          <div className="mx-auto px-6 py-4" style={{
            background: "linear-gradient(180deg, hsl(0 0% 4% / 0.9) 0%, hsl(0 0% 4% / 0.8) 100%)",
            backdropFilter: "blur(20px)",
            borderBottom: "1px solid hsl(0 0% 100% / 0.05)",
          }}>
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              {/* Brand */}
              <Link to="/" className="font-display text-2xl text-primary tracking-wider hover:opacity-80 transition-opacity">
                THE FORGE
              </Link>

              {/* Nav Links - Desktop */}
              <div className="hidden md:flex items-center gap-8">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href)}
                    className="text-xs tracking-[0.25em] text-muted-foreground/60 hover:text-primary uppercase transition-colors duration-300 relative group"
                  >
                    {link.label}
                    <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-primary group-hover:w-full transition-all duration-300" />
                  </a>
                ))}
              </div>

              {/* CTA */}
              <Link to="/apply">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="font-display text-sm tracking-[0.2em] px-6 py-2.5 border border-primary/40 text-primary hover:bg-primary hover:text-[hsl(0,0%,4%)] transition-all duration-300"
                >
                  OCAGA GIR
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
};

export default FloatingNav;
