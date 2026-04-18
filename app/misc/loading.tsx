export default function Loading() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex gap-2">
          <div className="h-4 w-32 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800" />
          <div className="h-4 w-48 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800" />
        </div>
      ))}
    </div>
  )
}
