// TaskPulse — Skeleton system. Replaces plain "Loading..." text everywhere.
// Base <Skeleton /> plus a few composed shapes for common surfaces.

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

/**
 * Base shimmer block. Compose with width/height/rounded utilities.
 * e.g. <Skeleton className="h-4 w-32 rounded-md" />
 */
export function Skeleton({ className = "" }) {
  return (
    <span
      aria-hidden="true"
      className={cn("tp-skeleton block rounded-md", className)}
    />
  );
}

export function SkeletonText({ lines = 3, className = "" }) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn("h-3.5", i === lines - 1 ? "w-2/3" : "w-full")}
        />
      ))}
    </div>
  );
}

export function SkeletonAvatar({ size = 40 }) {
  return (
    <span
      aria-hidden="true"
      className="tp-skeleton block rounded-full"
      style={{ width: size, height: size }}
    />
  );
}

/** Generic card skeleton — task cards, project cards, list rows. */
export function SkeletonCard({ className = "" }) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-surface p-4 shadow-tp-sm",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-9 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="mt-2 h-3 w-1/3" />
        </div>
      </div>
      <SkeletonText lines={2} className="mt-4" />
      <div className="mt-4 flex items-center gap-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
    </div>
  );
}

/** Vertical list of card skeletons. */
export function SkeletonList({ count = 4, className = "" }) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

/** Stat / metric tile skeleton for Command Center & Analytics. */
export function SkeletonStat({ className = "" }) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-surface p-5 shadow-tp-sm",
        className
      )}
    >
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-3 h-8 w-20" />
      <Skeleton className="mt-3 h-2 w-full rounded-full" />
    </div>
  );
}

/** Table skeleton — task list / team members. */
export function SkeletonTable({ rows = 6, columns = 4, className = "" }) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-border bg-surface",
        className
      )}
    >
      <div className="flex items-center gap-4 border-b border-border px-4 py-3">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-3 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div
          key={r}
          className="flex items-center gap-4 border-b border-border px-4 py-4 last:border-0"
        >
          {Array.from({ length: columns }).map((_, c) => (
            <Skeleton key={c} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}
