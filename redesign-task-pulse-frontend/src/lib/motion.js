// TaskPulse — shared Framer Motion presets.
// Keep motion subtle (150–250ms) and consistent across the app.
// All consumers should also respect prefers-reduced-motion; the global CSS
// already neutralizes CSS animations, and useReducedMotion() covers JS motion.

export const EASE_SPRING = [0.22, 1, 0.36, 1];
export const EASE_OUT = [0.16, 1, 0.3, 1];

// Fade + rise: default entrance for cards, panels, sections.
export const fadeUp = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: EASE_SPRING },
  },
  exit: { opacity: 0, y: 8, transition: { duration: 0.15 } },
};

export const fade = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

// Stagger container: wrap lists/grids, give children `fadeUp`.
export const staggerContainer = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.05, delayChildren: 0.04 },
  },
};

// Scale-in: for modals / popovers.
export const scaleIn = {
  hidden: { opacity: 0, scale: 0.96 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.2, ease: EASE_SPRING },
  },
  exit: { opacity: 0, scale: 0.96, transition: { duration: 0.15 } },
};

// Slide-over drawer (Task Detail, Ask AI). Pass direction "right" | "left".
export const drawer = (direction = "right") => ({
  hidden: { x: direction === "right" ? "100%" : "-100%" },
  show: {
    x: 0,
    transition: { type: "spring", stiffness: 340, damping: 34 },
  },
  exit: {
    x: direction === "right" ? "100%" : "-100%",
    transition: { duration: 0.2, ease: EASE_OUT },
  },
});

export const backdrop = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

// Interactive hover/tap for cards & buttons (use as props: {...hoverLift}).
export const hoverLift = {
  whileHover: { y: -2, transition: { duration: 0.15 } },
  whileTap: { y: 0, scale: 0.99 },
};

export const hoverScale = {
  whileHover: { scale: 1.02, transition: { duration: 0.15 } },
  whileTap: { scale: 0.98 },
};
