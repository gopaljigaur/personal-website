export function StatCallout({
  stat,
  label,
  source,
  sourceUrl,
}: {
  stat: string
  label: string
  source?: string
  sourceUrl?: string
}) {
  return (
    <div className="my-8 rounded-xl border border-neutral-200 bg-neutral-50 p-6 text-center dark:border-neutral-800 dark:bg-neutral-900/40">
      <p className="text-5xl font-bold tracking-tight text-neutral-900 dark:text-white">
        {stat}
      </p>
      <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">
        {label}
      </p>
      {source && (
        <p className="mt-2 text-xs text-neutral-400 dark:text-neutral-600">
          {sourceUrl ? (
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-neutral-600 dark:hover:text-neutral-400"
            >
              {source}
            </a>
          ) : (
            source
          )}
        </p>
      )}
    </div>
  )
}
