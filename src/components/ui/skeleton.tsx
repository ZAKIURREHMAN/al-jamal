export function ProductGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-busy>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="animate-pulse overflow-hidden rounded-3xl bg-white ring-1 ring-line/60">
          <div className="aspect-square bg-cream-deep/60" />
          <div className="space-y-3 p-5">
            <div className="h-5 w-2/3 rounded bg-cream-deep" />
            <div className="h-4 w-full rounded bg-cream-deep/70" />
            <div className="h-9 w-1/2 rounded-full bg-cream-deep/70" />
          </div>
        </div>
      ))}
    </div>
  );
}
