const rows = [
  { titleW: 'w-1/4', urlW: 'w-2/5' },
  { titleW: 'w-1/3', urlW: 'w-1/2' },
  { titleW: 'w-1/4', urlW: 'w-3/5' },
]

export default function Loading() {
  return (
    <ul className="space-y-4">
      {rows.map((row, i) => (
        <li key={i} className="block text-sm">
          <div className="flex items-center gap-2">
            <div
              className={`bg-subtle-inv h-4 animate-pulse rounded ${row.titleW}`}
            />
            <div className="bg-subtle-inv h-4 w-3 animate-pulse rounded" />
            <div
              className={`bg-subtle-inv h-4 animate-pulse rounded ${row.urlW}`}
            />
          </div>
        </li>
      ))}
    </ul>
  )
}
