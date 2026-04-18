import type { Metadata } from 'next'
import { miscLinks } from './data'

export const metadata: Metadata = { title: 'Miscellaneous' }

export default function Page() {
  return (
    <ul className="space-y-4">
      {miscLinks.map(({ title, url }) => (
        <li key={url}>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="group block text-sm"
          >
            <span className="text-neutral-900 dark:text-neutral-100">
              {title}
            </span>
            <span className="mx-2 text-neutral-300 dark:text-neutral-600">
              —
            </span>
            <span className="break-all text-neutral-400 transition-colors group-hover:text-neutral-600 dark:text-neutral-500 dark:group-hover:text-neutral-300">
              {url}
            </span>
          </a>
        </li>
      ))}
      {miscLinks.length === 0 && (
        <li className="text-sm text-neutral-400">Nothing here yet.</li>
      )}
    </ul>
  )
}
