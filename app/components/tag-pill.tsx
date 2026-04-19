import Link from 'next/link'

export function TagPill({
  tag,
  active,
  href,
}: {
  tag: string
  active: boolean
  href: string
}) {
  return (
    <Link
      href={href}
      className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs whitespace-nowrap transition-colors ${
        active
          ? 'btn-primary-inv'
          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700'
      }`}
    >
      {tag}
    </Link>
  )
}
