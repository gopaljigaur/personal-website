const tagWidths = ['w-12', 'w-16', 'w-20', 'w-14', 'w-24', 'w-16']
const cards = [
  { titleW: 'w-2/5', summaryLines: 3, links: 2 },
  { titleW: 'w-1/3', summaryLines: 2, links: 1 },
  { titleW: 'w-3/5', summaryLines: 3, links: 2 },
  { titleW: 'w-2/5', summaryLines: 2, links: 1 },
]

export default function Loading() {
  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        {tagWidths.map((w, i) => (
          <div
            key={i}
            className={`h-5 shrink-0 animate-pulse rounded-full bg-neutral-100 dark:bg-neutral-800 ${w}`}
          />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {cards.map((card, i) => (
          <div
            key={i}
            className="flex min-h-56 flex-col rounded-xl border border-neutral-200 p-5 dark:border-neutral-800"
          >
            <div
              className={`h-5 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800 ${card.titleW}`}
            />
            <div className="mt-2 flex flex-1 flex-col gap-2">
              {Array.from({ length: card.summaryLines }, (_, j) => (
                <div
                  key={j}
                  className={`h-3 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800 ${j === card.summaryLines - 1 ? 'w-3/4' : 'w-full'}`}
                />
              ))}
            </div>
            <div className="mt-4 flex gap-4">
              {Array.from({ length: card.links }, (_, j) => (
                <div
                  key={j}
                  className="h-4 w-12 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
