'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { SearchResult } from 'app/lib/search'

type Item = {
  group: 'Pages' | 'Blog' | 'Projects' | 'Misc'
  title: string
  subtitle?: string
  href: string
  external?: boolean
}

const PAGES: Item[] = [
  { group: 'Pages', title: 'Home', href: '/' },
  { group: 'Pages', title: 'Blog', href: '/blog' },
  { group: 'Pages', title: 'Projects', href: '/projects' },
  { group: 'Pages', title: 'Misc', href: '/misc' },
]

function resultToItem(r: SearchResult): Item {
  const groupMap = { blog: 'Blog', project: 'Projects', misc: 'Misc' } as const
  return {
    group: groupMap[r.type],
    title: r.title,
    subtitle: r.text,
    href: r.url,
    external: r.type !== 'blog',
  }
}

export function CommandPalette({
  posts,
  projects,
}: {
  posts: { title: string; slug: string; summary: string }[]
  projects: { title: string; summary: string; href: string }[]
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const [searchItems, setSearchItems] = useState<Item[] | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const router = useRouter()

  const staticItems: Item[] = [
    ...posts.map((p) => ({
      group: 'Blog' as const,
      title: p.title,
      subtitle: p.summary,
      href: `/blog/${p.slug}`,
    })),
    ...projects.map((p) => ({
      group: 'Projects' as const,
      title: p.title,
      subtitle: p.summary,
      href: p.href,
      external: true,
    })),
  ]

  const filtered: Item[] = query
    ? [
        ...PAGES.filter((p) =>
          p.title.toLowerCase().includes(query.toLowerCase()),
        ),
        ...(searchItems ?? []),
      ]
    : [...PAGES, ...staticItems]

  // Semantic search with debounce
  useEffect(() => {
    if (!query) {
      setSearchItems(null)
      return
    }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        const results: SearchResult[] = await res.json()
        setSearchItems(results.map(resultToItem))
      } catch {
        setSearchItems([])
      }
    }, 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query])

  useEffect(() => {
    const onKeydown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((o) => !o)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    const onOpen = () => setOpen(true)
    window.addEventListener('keydown', onKeydown)
    window.addEventListener('openCommandPalette', onOpen)
    return () => {
      window.removeEventListener('keydown', onKeydown)
      window.removeEventListener('openCommandPalette', onOpen)
    }
  }, [])

  useEffect(() => {
    if (open) {
      setQuery('')
      setSelected(0)
      setSearchItems(null)
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }, [open])

  useEffect(() => {
    setSelected(0)
  }, [query])

  const navigate = (item: Item) => {
    if (item.external) {
      window.open(item.href, '_blank')
    } else {
      router.push(item.href)
    }
    setOpen(false)
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelected((s) => Math.min(s + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelected((s) => Math.max(s - 1, 0))
    } else if (e.key === 'Enter' && filtered[selected]) {
      navigate(filtered[selected])
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[18vh]"
      onClick={() => setOpen(false)}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg rounded-xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-900"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={onKeyDown}
      >
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search pages, posts, projects…"
          className="w-full rounded-t-xl border-b border-neutral-200 bg-transparent px-4 py-3 text-sm outline-none placeholder:text-neutral-400 dark:border-neutral-800"
        />
        <ul className="max-h-72 overflow-y-auto rounded-b-xl py-2">
          {query && searchItems === null && (
            <li className="px-4 py-3 text-sm text-neutral-400">Searching…</li>
          )}
          {!(query && searchItems === null) && filtered.length === 0 && (
            <li className="px-4 py-3 text-sm text-neutral-400">No results</li>
          )}
          {!(query && searchItems === null) &&
            filtered.map((item, i) => (
              <li key={item.href}>
                <button
                  className={`flex w-full cursor-pointer flex-col px-4 py-2 text-left text-sm transition-colors ${
                    i === selected
                      ? 'bg-neutral-100 dark:bg-neutral-800'
                      : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                  }`}
                  onClick={() => navigate(item)}
                  onMouseEnter={() => setSelected(i)}
                >
                  <span className="font-medium text-neutral-900 dark:text-neutral-100">
                    {item.title}
                  </span>
                  {item.subtitle && (
                    <span className="mt-0.5 line-clamp-1 text-xs text-neutral-500 dark:text-neutral-400">
                      {item.subtitle}
                    </span>
                  )}
                </button>
              </li>
            ))}
        </ul>
      </div>
    </div>
  )
}
