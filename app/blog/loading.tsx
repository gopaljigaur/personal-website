export default function Loading() {
  return (
    <div>
      <div className="mb-6 flex gap-2">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-6 w-16 animate-pulse rounded-full bg-neutral-100 dark:bg-neutral-800"
          />
        ))}
      </div>
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex gap-4">
            <div className="h-4 w-24 shrink-0 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800" />
            <div className="h-4 w-48 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800" />
          </div>
        ))}
      </div>
    </div>
  )
}
