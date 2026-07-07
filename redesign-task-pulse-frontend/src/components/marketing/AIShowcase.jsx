import { motion } from "framer-motion";
import { Sparkles, TrendingUp, CalendarClock, MessageSquare } from "lucide-react";

const capabilities = [
  {
    icon: TrendingUp,
    title: "Priority scoring",
    body: "Every task gets a 0–100 score from deadlines, dependencies, and impact.",
  },
  {
    icon: CalendarClock,
    title: "Weekly digests",
    body: "A Monday brief of what shipped, what slipped, and what needs you.",
  },
  {
    icon: MessageSquare,
    title: "Ask AI, anywhere",
    body: "Query your workspace in plain language and act on the answer.",
  },
];

export default function AIShowcase() {
  return (
    <section id="ai" className="relative overflow-hidden py-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-[130px]"
        style={{ background: "var(--tp-ai-gradient)" }}
      />

      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <span className="tp-ai-border inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold text-foreground">
            <Sparkles className="h-3.5 w-3.5 text-ai-to" />
            <span className="tp-ai-text">TaskPulse AI</span>
          </span>
          <h2 className="mt-5 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            The layer that decides <span className="tp-ai-text">what matters next</span>
          </h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-muted">
            TaskPulse reads the signals your team creates and turns them into a
            clear, ranked plan — with reasoning you can trust and override.
          </p>

          <div className="mt-8 flex flex-col gap-5">
            {capabilities.map((c) => (
              <div key={c.title} className="flex gap-4">
                <span className="tp-ai-surface grid h-10 w-10 shrink-0 place-items-center rounded-lg">
                  <c.icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    {c.title}
                  </h3>
                  <p className="mt-0.5 text-sm leading-relaxed text-muted">
                    {c.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mock AI card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="tp-ai-border tp-ai-glow rounded-2xl p-6"
        >
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Sparkles className="h-4 w-4 text-ai-to" /> AI daily summary
            </span>
            <span className="rounded-full bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent">
              Today
            </span>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-muted">
            You have <span className="font-semibold text-foreground">3 high-priority</span>{" "}
            tasks. The <span className="font-semibold text-foreground">API migration</span>{" "}
            is blocking two teammates — I&apos;d start there.
          </p>

          <div className="mt-5 space-y-3">
            {[
              { name: "Ship API v2 migration", score: 94, tone: "text-priority-urgent" },
              { name: "Review onboarding flow", score: 78, tone: "text-priority-high" },
              { name: "Draft Q3 roadmap", score: 61, tone: "text-priority-medium" },
            ].map((t) => (
              <div
                key={t.name}
                className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3"
              >
                <span className="text-sm text-foreground">{t.name}</span>
                <span className={`text-sm font-semibold ${t.tone}`}>{t.score}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
