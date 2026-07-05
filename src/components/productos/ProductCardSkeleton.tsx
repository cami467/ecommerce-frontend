export function ProductCardSkeleton() {
  return (
    <div className="animate-pulse rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="aspect-square rounded-t-lg bg-gray-200" />
      <div className="space-y-3 p-4">
        <div className="h-3 w-20 rounded bg-gray-200" />
        <div className="h-4 w-full rounded bg-gray-200" />
        <div className="h-4 w-2/3 rounded bg-gray-200" />
        <div className="h-9 w-full rounded bg-gray-200" />
      </div>
    </div>
  )
}