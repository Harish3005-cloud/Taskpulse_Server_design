import { Moon, Sun } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "../../providers/ThemeProvider";

/**
 * ThemeToggle — animated sun/moon switch wired to ThemeProvider.
 * Drop into the header, sidebar footer, or settings.
 */
export function ThemeToggle({ className = "" }) {
  const { resolvedTheme, toggleTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={
        "relative inline-flex h-9 w-9 items-center justify-center rounded-lg " +
        "border border-border bg-surface text-muted transition-colors " +
        "hover:text-foreground hover:border-border-strong " +
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent " +
        className
      }
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isDark ? "moon" : "sun"}
          initial={{ scale: 0, rotate: -90, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          exit={{ scale: 0, rotate: 90, opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inline-flex"
        >
          {isDark ? <Moon size={18} /> : <Sun size={18} />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

export default ThemeToggle;
