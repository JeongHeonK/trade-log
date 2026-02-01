function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div className={`bg-muted animate-pulse rounded-md ${className ?? ""}`} />
  );
}

function SkeletonCard() {
  return (
    <div className="ring-foreground/10 flex flex-col gap-3 rounded-xl bg-card p-4 shadow-xs ring-1">
      <div className="flex items-center justify-between">
        <SkeletonBlock className="h-5 w-24" />
        <SkeletonBlock className="h-5 w-16" />
      </div>
      <div className="flex items-center gap-2">
        <SkeletonBlock className="h-4 w-20" />
        <SkeletonBlock className="h-4 w-28" />
      </div>
    </div>
  );
}

export default function TradesLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <SkeletonBlock className="h-7 w-28" />
        <SkeletonBlock className="h-9 w-32 rounded-lg" />
      </div>
      <div className="flex gap-2">
        <SkeletonBlock className="h-9 w-24 rounded-lg" />
        <SkeletonBlock className="h-9 w-24 rounded-lg" />
      </div>
      <div className="flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={`skeleton-${i.toString()}`} />
        ))}
      </div>
    </div>
  );
}
