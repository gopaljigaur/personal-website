'use client'

import { useEffect, useState } from 'react'
import type { Heading } from 'app/blog/utils.shared'

export function TableOfContents({ headings }: { headings: Heading[] }) {
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    if (headings.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
            break
          }
        }
      },
      { rootMargin: '0px 0px -80% 0px', threshold: 0 },
    )

    headings.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [headings])

  if (headings.length < 2) return null

  return (
    <nav className="rounded-lg border border-neutral-200 px-5 py-4 text-sm dark:border-neutral-800">
      <p className="from-dark-secondary to-dark-primary mb-2 inline-block bg-gradient-to-tr bg-clip-text font-medium text-transparent">
        On this page
      </p>
      <ul className="space-y-1.5">
        {headings.map((h) => (
          <li key={h.id} style={{ paddingLeft: `${(h.level - 2) * 12}px` }}>
            <a
              href={`#${h.id}`}
              className={`transition-colors hover:text-neutral-900 focus-visible:text-neutral-900 focus-visible:outline-none dark:hover:text-neutral-100 dark:focus-visible:text-neutral-100 ${
                activeId === h.id
                  ? 'text-neutral-700 dark:text-neutral-300'
                  : 'text-neutral-500 dark:text-neutral-400'
              }`}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
