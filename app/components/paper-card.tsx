type PaperCardProps = {
  title: string
  authors: string[]
  venue: string
  arxivId?: string
  projectUrl?: string
}

export function PaperCard({
  title,
  authors,
  venue,
  arxivId,
  projectUrl,
}: PaperCardProps) {
  return (
    <div className="not-prose my-6 rounded-lg border border-neutral-200 bg-neutral-50 p-5 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="mb-1 text-xs font-medium tracking-wide text-neutral-500 uppercase dark:text-neutral-500">
        {venue}
      </div>
      <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
        {title}
      </h3>
      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
        {authors.join(', ')}
      </p>
      {(arxivId || projectUrl) && (
        <div className="mt-3 flex flex-wrap gap-2">
          {arxivId && (
            <a
              href={`https://arxiv.org/abs/${arxivId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-neutral-300 px-3 py-1 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              arXiv:{arxivId}
            </a>
          )}
          {projectUrl && (
            <a
              href={projectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-neutral-300 px-3 py-1 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              Project page
            </a>
          )}
        </div>
      )}
    </div>
  )
}
