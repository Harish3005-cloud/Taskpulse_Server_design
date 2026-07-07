import { motion } from "framer-motion";
import {
  LayoutGrid,
  Zap,
  Users,
  Bell,
  GitBranch,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/cn";

const features = [
  {
    icon: LayoutGrid,
    title: "Views that fit how you work",
    body: "List, board, and calendar — save filtered views per team and switch instantly.",
    className: "sm:col-span-2",
  },
  {
    icon: Zap,
    title: "Real-time by default",
    body: "Changes sync live across every device and teammate. No refresh, ever.",
  },
  {
    icon: Users,
    title: "Multi-tenant workspaces",
    body: "Separate teams, projects, and permissions — cleanly isolated.",
  },
  {
    icon: Bell,
    title: "An inbox that respects focus",
    body: "Notifications grouped by project, with mentions surfaced first.",
  },
  {
    icon: Filter,
    title: "Powerful command palette",
    body: "Jump to anything and run actions from the keyboard in milliseconds.",
    className: "sm:col-span-2",
  },
];

const card = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export default function FeatureBento() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold text-accent">Built for velocity</p>
        <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Everything your team needs, nothing it doesn&apos;t
        </h2>
        <p className="mt-4 text-pretty text-lg leading-relaxed text-muted">
          The structure of a serious project tool, with the speed and calm of a
          product you actually enjoy opening.
        </p>
      </div>

      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        transition={{ staggerChildren: 0.08 }}
        className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-3"
      >
        {features.map((f) => (
          <motion.div
            key={f.title}
            variants={card}
            className={cn(
              "group rounded-xl border border-border bg-surface p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-border-strong hover:shadow-tp-md",
              f.className
            )}
          >
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-accent-soft text-accent">
              <f.icon className="h-5 w-5" />
            </span>
            <h3 className="mt-4 text-base font-semibold text-foreground">
              {f.title}
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">{f.body}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
