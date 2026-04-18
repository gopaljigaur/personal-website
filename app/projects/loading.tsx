export default function Loading() {
  return (
    <div className="space-y-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-5 w-40 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800" />
          <div className="h-4 w-64 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800" />
        </div>
      ))}
    </div>
  )
}
