import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Activity, Menu, X } from "lucide-react";
import Button from "@/components/ui/Button";
import ThemeToggle from "@/components/shared/ThemeToggle";
import { cn } from "@/lib/cn";

const links = [
  { label: "Product", href: "#features" },
  { label: "AI", href: "#ai" },
  { label: "How it works", href: "#how" },
  { label: "Pricing", href: "#pricing" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        scrolled ? "tp-glass border-b border-border" : "border-b border-transparent"
      )}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a href="#" className="flex items-center gap-2 font-semibold text-foreground">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-accent-foreground">
            <Activity className="h-4.5 w-4.5" strokeWidth={2.5} />
          </span>
          <span className="text-[15px] tracking-tight">TaskPulse</span>
        </a>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="rounded-md px-3 py-2 text-sm text-muted transition-colors hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          <Button as="a" href="#" variant="ghost" size="sm">
            Sign in
          </Button>
          <Button as="a" href="#" variant="primary" size="sm">
            Start free
          </Button>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="grid h-10 w-10 place-items-center rounded-lg text-foreground md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-border bg-surface px-4 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm text-muted hover:bg-accent-soft hover:text-foreground"
              >
                {l.label}
              </a>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <Button as="a" href="#" variant="secondary" size="sm" className="flex-1">
              Sign in
            </Button>
            <Button as="a" href="#" variant="primary" size="sm" className="flex-1">
              Start free
            </Button>
            <ThemeToggle />
          </div>
        </div>
      )}
    </motion.header>
  );
}
