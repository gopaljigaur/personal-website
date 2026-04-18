const rows = [
  { titleW: 'w-28', urlW: 'w-48' },
  { titleW: 'w-36', urlW: 'w-56' },
  { titleW: 'w-24', urlW: 'w-64' },
]

export default function Loading() {
  return (
    <ul className="space-y-4">
      {rows.map((row, i) => (
        <li key={i} className="block text-sm">
          <div className="flex items-center">
            <div
              className={`h-4 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800 ${row.titleW}`}
            />
            <div className="mx-2 h-4 w-2 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800" />
            <div
              className={`h-4 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800 ${row.urlW}`}
            />
          </div>
        </li>
      ))}
    </ul>
  )
}
