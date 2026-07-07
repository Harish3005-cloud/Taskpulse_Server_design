import { motion } from "framer-motion";

const quotes = [
  {
    quote:
      "The AI priority score is uncanny. Standups got shorter because everyone already knows what matters.",
    name: "Maya Chen",
    role: "Head of Product, Northwind",
  },
  {
    quote:
      "We replaced three tools with TaskPulse. Real-time sync and views per team were the tipping point.",
    name: "Daniel Okafor",
    role: "Engineering Lead, Cobalt",
  },
  {
    quote:
      "The weekly digest is the first email I read on Monday. It's like a chief of staff for the whole team.",
    name: "Priya Nair",
    role: "COO, Lumen",
  },
];

export default function Testimonials() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Teams move faster with TaskPulse
        </h2>
      </div>

      <div className="mt-14 grid gap-4 md:grid-cols-3">
        {quotes.map((q, i) => (
          <motion.figure
            key={q.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col justify-between rounded-xl border border-border bg-surface p-6"
          >
            <blockquote className="text-pretty text-[15px] leading-relaxed text-foreground">
              &ldquo;{q.quote}&rdquo;
            </blockquote>
            <figcaption className="mt-6 flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-accent-soft text-sm font-semibold text-accent">
                {q.name.charAt(0)}
              </span>
              <div>
                <div className="text-sm font-semibold text-foreground">
                  {q.name}
                </div>
                <div className="text-xs text-muted">{q.role}</div>
              </div>
            </figcaption>
          </motion.figure>
        ))}
      </div>
    </section>
  );
}
