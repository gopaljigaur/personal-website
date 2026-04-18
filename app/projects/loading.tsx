const cards = [
  {
    titleW: 'w-40',
    summaryLines: ['w-full', 'w-full', 'w-3/4'],
    techW: 'w-36',
    links: 2,
  },
  {
    titleW: 'w-32',
    summaryLines: ['w-full', 'w-full', 'w-1/2'],
    techW: 'w-44',
    links: 1,
  },
  {
    titleW: 'w-48',
    summaryLines: ['w-full', 'w-5/6'],
    techW: 'w-40',
    links: 2,
  },
  {
    titleW: 'w-36',
    summaryLines: ['w-full', 'w-full', 'w-2/3'],
    techW: 'w-32',
    links: 1,
  },
  {
    titleW: 'w-44',
    summaryLines: ['w-full', 'w-3/4'],
    techW: 'w-36',
    links: 2,
  },
]

export default function Loading() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {cards.map((card, i) => (
        <div
          key={i}
          className="flex min-h-56 flex-col rounded-xl border border-neutral-200 p-5 dark:border-neutral-800"
        >
          {/* title */}
          <div
            className={`h-4 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800 ${card.titleW}`}
          />
          {/* summary — flex-1 so it stretches */}
          <div className="mt-2 flex flex-1 flex-col gap-2">
            {card.summaryLines.map((lw, j) => (
              <div
                key={j}
                className={`h-3 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800 ${lw}`}
              />
            ))}
          </div>
          {/* techStack */}
          <div
            className={`mt-4 h-3 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800 ${card.techW}`}
          />
          {/* links */}
          <div className="mt-4 flex gap-4">
            {[...Array(card.links)].map((_, j) => (
              <div
                key={j}
                className="h-4 w-12 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
