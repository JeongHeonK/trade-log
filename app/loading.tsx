import { Card, CardContent, CardHeader } from "@/shared/ui/card";

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div className={`bg-muted animate-pulse rounded-md ${className ?? ""}`} />
  );
}

export default function Loading() {
  return (
    <div className="space-y-6">
      <SkeletonBlock className="h-8 w-40" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card size="sm" key={`skeleton-${i.toString()}`}>
            <CardHeader>
              <SkeletonBlock className="h-4 w-24" />
            </CardHeader>
            <CardContent className="-mt-2">
              <SkeletonBlock className="h-7 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
