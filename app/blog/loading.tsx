export default function Loading() {
  const tagWidths = ['w-16', 'w-20', 'w-12', 'w-24', 'w-16', 'w-20', 'w-14']
  const titleWidths = ['w-48', 'w-64', 'w-40', 'w-56', 'w-52', 'w-44']

  return (
    <div className="min-w-0">
      {/* Tag pills row — matches flex flex-nowrap gap-2 mb-6 relative */}
      <div className="relative mb-6">
        <div className="flex flex-nowrap gap-2 overflow-hidden">
          {tagWidths.map((w, i) => (
            <div
              key={i}
              className={`h-5 shrink-0 animate-pulse rounded-full bg-neutral-100 dark:bg-neutral-800 ${w}`}
            />
          ))}
        </div>
      </div>

      {/* Post rows — matches mb-4 flex flex-col > flex w-full flex-col md:flex-row */}
      <div>
        {titleWidths.map((w, i) => (
          <div key={i} className="mb-4 flex flex-col space-y-1">
            <div className="flex w-full flex-col space-x-0 md:flex-row md:space-x-2">
              <div className="h-4 w-35 shrink-0 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800" />
              <div
                className={`mt-1 h-4 animate-pulse rounded bg-neutral-100 md:mt-0 dark:bg-neutral-800 ${w}`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
