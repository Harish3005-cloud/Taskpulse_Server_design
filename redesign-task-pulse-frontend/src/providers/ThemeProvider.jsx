import { createContext, useContext, useEffect, useState, useCallback } from "react";

const STORAGE_KEY = "taskpulse-theme";

const ThemeContext = createContext({
  theme: "dark",
  resolvedTheme: "dark",
  setTheme: () => {},
  toggleTheme: () => {},
});

/**
 * ThemeProvider — dark-first theming for TaskPulse.
 *
 * - theme: "dark" | "light" | "system"
 * - resolvedTheme: the actual applied theme ("dark" | "light")
 * - Persists choice in localStorage, honors OS preference for "system".
 * - Applies `.dark` class to <html> so Tailwind (darkMode: "class") + our
 *   CSS variables switch together.
 *
 * To avoid a flash of the wrong theme, also add the inline script from
 * `themeInitScript` (exported below) to your index.html <head>.
 */
export function ThemeProvider({ children, defaultTheme = "dark" }) {
  const [theme, setThemeState] = useState(() => {
    if (typeof window === "undefined") return defaultTheme;
    return localStorage.getItem(STORAGE_KEY) || defaultTheme;
  });

  const [resolvedTheme, setResolvedTheme] = useState("dark");

  const apply = useCallback((nextTheme) => {
    const prefersDark =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    const resolved =
      nextTheme === "system" ? (prefersDark ? "dark" : "light") : nextTheme;

    const root = document.documentElement;
    root.classList.toggle("dark", resolved === "dark");
    root.style.colorScheme = resolved;
    setResolvedTheme(resolved);
  }, []);

  // Apply on mount + whenever theme changes.
  useEffect(() => {
    apply(theme);
  }, [theme, apply]);

  // React to OS changes while in "system" mode.
  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => apply("system");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme, apply]);

  const setTheme = useCallback((next) => {
    localStorage.setItem(STORAGE_KEY, next);
    setThemeState(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }, [resolvedTheme, setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

/**
 * Paste this into index.html <head> BEFORE your bundle to prevent a
 * flash of incorrect theme on first paint (dark-first default):
 *
 * <script>
 *   (function () {
 *     try {
 *       var t = localStorage.getItem("taskpulse-theme") || "dark";
 *       var dark = t === "dark" || (t === "system" &&
 *         window.matchMedia("(prefers-color-scheme: dark)").matches);
 *       document.documentElement.classList.toggle("dark", dark);
 *       document.documentElement.style.colorScheme = dark ? "dark" : "light";
 *     } catch (e) {}
 *   })();
 * </script>
 */
export const themeInitScript = `(function(){try{var t=localStorage.getItem("taskpulse-theme")||"dark";var d=t==="dark"||(t==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d);document.documentElement.style.colorScheme=d?"dark":"light";}catch(e){}})();`;
