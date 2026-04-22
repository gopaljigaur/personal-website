const rows = [
  { titleW: 'w-1/4', urlW: 'w-2/5' },
  { titleW: 'w-1/3', urlW: 'w-1/2' },
  { titleW: 'w-1/4', urlW: 'w-3/5' },
  { titleW: 'w-1/5', urlW: 'w-1/3' },
  { titleW: 'w-2/5', urlW: 'w-3/5' },
]

export default function Loading() {
  return (
    <ul className="space-y-4">
      {rows.map((row, i) => (
        <li key={i} className="text-sm">
          <div className="flex items-baseline gap-0">
            <div
              className={`bg-subtle-inv h-[0.875rem] animate-pulse rounded ${row.titleW}`}
            />
            <span className="mx-2" />
            <div
              className={`bg-subtle-inv h-[0.875rem] animate-pulse rounded ${row.urlW}`}
            />
          </div>
        </li>
      ))}
    </ul>
  )
}
