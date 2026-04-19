const titleWidths = ['w-3/5', 'w-4/5', 'w-1/2', 'w-2/3', 'w-3/4', 'w-3/5']
const tagWidths = ['w-12', 'w-16', 'w-20', 'w-14', 'w-24', 'w-16']

export default function Loading() {
  return (
    <div className="min-w-0">
      <div className="mb-6 flex flex-wrap gap-2">
        {tagWidths.map((w, i) => (
          <div
            key={i}
            className={`bg-subtle-inv h-5 shrink-0 animate-pulse rounded-full ${w}`}
          />
        ))}
      </div>
      <div>
        {titleWidths.map((w, i) => (
          <div key={i} className="mb-4 flex flex-col space-y-1">
            <div className="flex w-full flex-col space-x-0 md:flex-row md:space-x-2">
              <div className="bg-subtle-inv h-4 w-35 shrink-0 animate-pulse rounded" />
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
