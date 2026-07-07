import { motion } from "framer-motion";

const steps = [
  {
    n: "01",
    title: "Create your workspace",
    body: "Spin up a team, invite people, and organize work into projects in minutes.",
  },
  {
    n: "02",
    title: "Capture and connect tasks",
    body: "Add tasks with owners, deadlines, and dependencies — or import what you have.",
  },
  {
    n: "03",
    title: "Let AI rank the day",
    body: "TaskPulse scores priority and drafts a focused plan you can adjust anytime.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how" className="border-y border-border bg-surface/50">
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold text-accent">How it works</p>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            From zero to in-flow in three steps
          </h2>
        </div>

        <div className="mt-14 grid gap-8 sm:grid-cols-3">
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              <span className="text-sm font-semibold text-accent">{s.n}</span>
              <div className="mt-2 h-px w-full bg-border" />
              <h3 className="mt-4 text-lg font-semibold text-foreground">
                {s.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{s.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
