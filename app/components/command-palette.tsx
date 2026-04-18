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
  score?: number
}

const PAGES: Item[] = [
  { group: 'Pages', title: 'Home', href: '/' },
  { group: 'Pages', title: 'Blog', href: '/blog' },
  { group: 'Pages', title: 'Projects', href: '/projects' },
  { group: 'Pages', title: 'Misc', href: '/misc' },
]

const GROUP_STYLE: Record<Item['group'], string> = {
  Pages:
    'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400',
  Blog: 'bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400',
  Projects:
    'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400',
  Misc: 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400',
}

// Higher = shown first. Title match beats subtitle match; semantic score breaks ties.
function rankScore(item: Item, lq: string): number {
  const semantic = item.score ?? 0
  if (item.title.toLowerCase().includes(lq)) return 2.0 + semantic * 0.5
  if (item.subtitle?.toLowerCase().includes(lq)) return 1.0 + semantic * 0.5
  return semantic
}

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return <>{text}</>
  return (
    <>
      {text.slice(0, idx)}
      <span className="rounded bg-yellow-200 font-semibold text-yellow-900 dark:bg-yellow-800/50 dark:text-yellow-200">
        {text.slice(idx, idx + query.length)}
      </span>
      {text.slice(idx + query.length)}
    </>
  )
}

function resultToItem(r: SearchResult): Item {
  const groupMap = { blog: 'Blog', project: 'Projects', misc: 'Misc' } as const
  return {
    group: groupMap[r.type],
    title: r.title,
    subtitle: r.text,
    href: r.url,
    external: r.type !== 'blog',
    score: r.score,
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

  const lq = query.toLowerCase()

  // Merge all sources into a map keyed by href, then sort by hybrid rank score.
  // Text matches are added first; semantic results enrich them with a score or add new entries.
  const filtered: Item[] = (() => {
    if (!query) return []
    const map = new Map<string, Item>()
    // Pages + static text matches
    ;[
      ...PAGES.filter((p) => p.title.toLowerCase().includes(lq)),
      ...staticItems.filter(
        (item) =>
          item.title.toLowerCase().includes(lq) ||
          item.subtitle?.toLowerCase().includes(lq),
      ),
    ].forEach((item) => map.set(item.href, item))
    // Semantic results: update score on existing entries or add new ones
    ;(searchItems ?? []).forEach((item) => {
      if (map.has(item.href)) {
        map.set(item.href, { ...map.get(item.href)!, score: item.score })
      } else {
        map.set(item.href, item)
      }
    })
    return [...map.values()].sort((a, b) => rankScore(b, lq) - rankScore(a, lq))
  })()

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

  const skeletonWidths = [
    ['w-2/5', 'w-3/5'],
    ['w-3/5', 'w-4/5'],
    ['w-1/2', 'w-2/3'],
    ['w-1/3', 'w-1/2'],
  ]

  const showSkeleton = !!query && searchItems === null && filtered.length === 0

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[18vh]"
      onClick={() => setOpen(false)}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative mx-4 w-full max-w-lg rounded-xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-900"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={onKeyDown}
      >
        <div className="relative flex items-center border-b border-neutral-200 dark:border-neutral-800">
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages, posts, projects…"
            className="w-full rounded-t-xl bg-transparent px-4 py-3 text-base outline-none placeholder:text-neutral-400 sm:text-sm"
          />
          {query && (
            <button
              onClick={() => {
                setQuery('')
                inputRef.current?.focus()
              }}
              aria-label="Clear search"
              className="absolute right-3 flex cursor-pointer items-center justify-center rounded-full p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:outline-none dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <ul className="h-72 overflow-y-auto rounded-b-xl py-2">
          {showSkeleton &&
            skeletonWidths.map(([tw, sw], i) => (
              <li key={i} className="flex flex-col gap-1.5 px-4 py-2.5">
                <div
                  className={`h-3.5 animate-pulse rounded ${tw} bg-neutral-100 dark:bg-neutral-800`}
                />
                <div
                  className={`h-3 animate-pulse rounded ${sw} bg-neutral-100 dark:bg-neutral-800`}
                />
              </li>
            ))}
          {!showSkeleton && filtered.length === 0 && (
            <li className="flex h-full items-center justify-center py-10 text-sm text-neutral-400">
              No results
            </li>
          )}
          {!showSkeleton &&
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
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-medium text-neutral-900 dark:text-neutral-100">
                      <Highlight text={item.title} query={query} />
                    </span>
                    <span
                      className={`mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-xs font-medium ${GROUP_STYLE[item.group]}`}
                    >
                      {item.group}
                    </span>
                  </div>
                  {item.subtitle && (
                    <span className="mt-0.5 line-clamp-1 text-xs text-neutral-500 dark:text-neutral-400">
                      <Highlight text={item.subtitle} query={query} />
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
