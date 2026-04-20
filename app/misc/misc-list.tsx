import { LinkPreview } from 'app/components/link-preview'

export function MiscLinksList({
  links,
}: {
  links: { title: string; url: string }[]
}) {
  return (
    <ul className="space-y-4">
      {links.map(({ title, url }) => (
        <li key={url}>
          <LinkPreview href={url} className="group block text-sm">
            <span className="text-primary-inv">{title}</span>
            <span className="mx-2 text-neutral-300 dark:text-neutral-600">
              —
            </span>
            <span className="break-all text-neutral-400 transition-colors group-hover:text-neutral-600 dark:text-neutral-500 dark:group-hover:text-neutral-300">
              {url}
            </span>
          </LinkPreview>
        </li>
      ))}
      {links.length === 0 && (
        <li className="text-sm text-neutral-400">Nothing here yet.</li>
      )}
    </ul>
  )
}
