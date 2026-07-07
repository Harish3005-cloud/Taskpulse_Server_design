/** @type {import('tailwindcss').Config} */
// TaskPulse — Tailwind v3 config. Maps CSS variables (--tp-*) to semantic
// Tailwind tokens so components can use classes like `bg-surface text-muted`.
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Surfaces
        bg: "var(--tp-bg)",
        surface: "var(--tp-surface)",
        elevated: "var(--tp-elevated)",

        // Text (use as text-foreground / text-muted / text-subtle)
        foreground: "var(--tp-text)",
        muted: "var(--tp-text-muted)",
        subtle: "var(--tp-text-subtle)",

        // Brand accent
        accent: {
          DEFAULT: "var(--tp-accent)",
          hover: "var(--tp-accent-hover)",
          soft: "var(--tp-accent-soft)",
          foreground: "var(--tp-on-accent)",
        },

        // Borders
        border: {
          DEFAULT: "var(--tp-border)",
          strong: "var(--tp-border-strong)",
        },

        // Semantic
        success: {
          DEFAULT: "var(--tp-success)",
          soft: "var(--tp-success-soft)",
        },
        warning: {
          DEFAULT: "var(--tp-warning)",
          soft: "var(--tp-warning-soft)",
        },
        danger: {
          DEFAULT: "var(--tp-danger)",
          soft: "var(--tp-danger-soft)",
        },
        info: {
          DEFAULT: "var(--tp-info)",
          soft: "var(--tp-info-soft)",
        },

        // Priority
        priority: {
          urgent: "var(--tp-priority-urgent)",
          high: "var(--tp-priority-high)",
          medium: "var(--tp-priority-medium)",
          low: "var(--tp-priority-low)",
        },

        // AI identity (reserve for AI surfaces)
        ai: {
          from: "var(--tp-ai-from)",
          to: "var(--tp-ai-to)",
          soft: "var(--tp-ai-soft)",
        },
      },
      fontFamily: {
        sans: [
          "Geist Variable",
          "Geist Fallback",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
        mono: ["Geist Mono Variable", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      borderRadius: {
        sm: "var(--tp-radius-sm)",
        DEFAULT: "var(--tp-radius)",
        lg: "var(--tp-radius-lg)",
        xl: "var(--tp-radius-xl)",
      },
      boxShadow: {
        "tp-sm": "var(--tp-shadow-sm)",
        "tp-md": "var(--tp-shadow-md)",
        "tp-lg": "var(--tp-shadow-lg)",
      },
      backgroundImage: {
        "ai-gradient": "var(--tp-ai-gradient)",
      },
      keyframes: {
        "tp-shimmer": {
          "100%": { transform: "translateX(100%)" },
        },
        "tp-fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "tp-shimmer": "tp-shimmer 1.5s infinite",
        "tp-fade-up": "tp-fade-up 0.25s ease-out both",
      },
      transitionTimingFunction: {
        "tp-spring": "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
};
