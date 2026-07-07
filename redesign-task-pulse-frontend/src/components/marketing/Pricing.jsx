import { motion } from "framer-motion";
import { Check } from "lucide-react";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/cn";

const tiers = [
  {
    name: "Free",
    price: "$0",
    cadence: "/ forever",
    description: "For small teams getting organized.",
    features: ["Up to 5 members", "Unlimited tasks", "List & board views", "Real-time sync"],
    cta: "Start free",
    variant: "secondary",
  },
  {
    name: "Pro",
    price: "$12",
    cadence: "/ user / mo",
    description: "AI-powered planning for growing teams.",
    features: [
      "Everything in Free",
      "AI priority scoring",
      "Weekly AI digests",
      "Ask AI assistant",
      "Advanced analytics",
    ],
    cta: "Start 14-day trial",
    variant: "primary",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    cadence: "",
    description: "Security and scale for large orgs.",
    features: ["Everything in Pro", "SSO & SCIM", "Audit logs", "Dedicated support"],
    cta: "Contact sales",
    variant: "secondary",
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold text-accent">Pricing</p>
        <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Simple plans that scale with you
        </h2>
      </div>

      <div className="mt-14 grid gap-4 lg:grid-cols-3">
        {tiers.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "flex flex-col rounded-2xl border bg-surface p-7",
              t.highlighted
                ? "tp-ai-border tp-ai-glow"
                : "border-border"
            )}
          >
            {t.highlighted && (
              <span className="tp-ai-text mb-3 text-xs font-semibold uppercase tracking-wider">
                Most popular
              </span>
            )}
            <h3 className="text-lg font-semibold text-foreground">{t.name}</h3>
            <p className="mt-1 text-sm text-muted">{t.description}</p>
            <div className="mt-5 flex items-baseline gap-1">
              <span className="text-4xl font-semibold tracking-tight text-foreground">
                {t.price}
              </span>
              <span className="text-sm text-muted">{t.cadence}</span>
            </div>

            <ul className="mt-6 flex flex-1 flex-col gap-3">
              {t.features.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-muted">
                  <Check className="h-4 w-4 shrink-0 text-accent" />
                  {f}
                </li>
              ))}
            </ul>

            <Button
              as="a"
              href="#"
              variant={t.variant}
              size="md"
              className="mt-7 w-full"
            >
              {t.cta}
            </Button>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
