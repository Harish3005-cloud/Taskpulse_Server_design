import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Button from "@/components/ui/Button";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-28 sm:pt-32">
      {/* Ambient AI glow — the only place the gradient orb appears */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 right-[-10%] h-[520px] w-[520px] rounded-full opacity-40 blur-[120px]"
        style={{ background: "var(--tp-ai-gradient)" }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border-strong to-transparent"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="mx-auto max-w-3xl text-center"
        >
          <motion.a
            variants={item}
            href="#ai"
            className="tp-ai-border inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium text-foreground"
          >
            <Sparkles className="h-3.5 w-3.5 text-ai-to" />
            <span className="tp-ai-text font-semibold">New</span>
            <span className="text-muted">AI priority scoring for every task</span>
          </motion.a>

          <motion.h1
            variants={item}
            className="mt-6 text-balance text-5xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-6xl lg:text-7xl"
          >
            Task management that
            <br className="hidden sm:block" /> thinks{" "}
            <span className="tp-ai-text">a step ahead</span>.
          </motion.h1>

          <motion.p
            variants={item}
            className="mx-auto mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted"
          >
            TaskPulse scores what matters, drafts your day, and keeps every team
            in sync in real time — so your work moves at the speed of your ideas.
          </motion.p>

          <motion.div
            variants={item}
            className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Button as="a" href="#" size="lg" className="group">
              Start free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
            <Button as="a" href="#how" variant="secondary" size="lg">
              See how it works
            </Button>
          </motion.div>

          <motion.p variants={item} className="mt-4 text-sm text-subtle">
            Free for small teams · No credit card required
          </motion.p>
        </motion.div>

        {/* Product screenshot */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto mt-16 max-w-6xl"
        >
          <div className="tp-ai-glow overflow-hidden rounded-xl border border-border bg-surface shadow-tp-lg">
            <img
              src="/product/dashboard-hero.png"
              alt="TaskPulse dashboard showing prioritized tasks and an AI summary panel"
              className="w-full"
              loading="eager"
            />
          </div>
          {/* Fade the bottom edge into the page */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 -bottom-1 h-32 bg-gradient-to-t from-bg to-transparent"
          />
        </motion.div>
      </div>
    </section>
  );
}
