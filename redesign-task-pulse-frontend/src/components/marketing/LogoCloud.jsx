const logos = ["Northwind", "Acme", "Lumen", "Cobalt", "Vertex", "Halcyon"];

export default function LogoCloud() {
  return (
    <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
      <p className="text-center text-xs font-medium uppercase tracking-widest text-subtle">
        Trusted by fast-moving teams
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-6 sm:gap-x-14">
        {logos.map((name) => (
          <span
            key={name}
            className="text-lg font-semibold tracking-tight text-subtle transition-colors hover:text-muted"
          >
            {name}
          </span>
        ))}
      </div>
    </section>
  );
}
