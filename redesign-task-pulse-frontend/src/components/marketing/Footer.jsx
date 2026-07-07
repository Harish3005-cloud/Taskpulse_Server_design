import { Activity } from "lucide-react";

const columns = [
  {
    title: "Product",
    links: ["Features", "AI", "Pricing", "Changelog", "Roadmap"],
  },
  {
    title: "Company",
    links: ["About", "Careers", "Blog", "Contact"],
  },
  {
    title: "Resources",
    links: ["Docs", "Guides", "API", "Status"],
  },
  {
    title: "Legal",
    links: ["Privacy", "Terms", "Security"],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.5fr_repeat(4,1fr)]">
          <div>
            <a href="#" className="flex items-center gap-2 font-semibold text-foreground">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-accent-foreground">
                <Activity className="h-4.5 w-4.5" strokeWidth={2.5} />
              </span>
              <span className="text-[15px] tracking-tight">TaskPulse</span>
            </a>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
              AI-powered task management for high-velocity teams.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-foreground">{col.title}</h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-muted transition-colors hover:text-foreground"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-sm text-subtle">
            © {new Date().getFullYear()} TaskPulse. All rights reserved.
          </p>
          <p className="text-sm text-subtle">Made for teams that ship.</p>
        </div>
      </div>
    </footer>
  );
}
