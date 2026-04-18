'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { TagPill } from 'app/components/tag-pill'
import { formatDate } from 'app/blog/utils.shared'
import type { BlogPost } from 'app/blog/utils.shared'

function tagHref(tag: string, activeTags: string[]) {
  const next = activeTags.includes(tag)
    ? activeTags.filter((t) => t !== tag)
    : [...activeTags, tag]
  return next.length === 0
    ? '/blog'
    : `/blog?tags=${next.map(encodeURIComponent).join(',')}`
}

const MORE_BTN_CLASS =
  'shrink-0 whitespace-nowrap rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'

export function BlogPostsWithFilter({
  posts,
  allTags,
  activeTags,
}: {
  posts: BlogPost[]
  allTags: string[]
  activeTags: string[]
}) {
  const [expanded, setExpanded] = useState(false)
  const [visibleCount, setVisibleCount] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const moreBtnRef = useRef<HTMLButtonElement>(null)
  const tagWidthsRef = useRef<number[]>([])

  useEffect(() => {
    if (expanded) return

    const el = containerRef.current
    if (!el) return

    const GAP = 8 // gap-2

    const recalculate = (containerWidth: number) => {
      const widths = tagWidthsRef.current
      if (widths.length === 0) return
      const moreWidth = moreBtnRef.current?.offsetWidth ?? 40

      let total = 0
      let count = 0

      for (let i = 0; i < widths.length; i++) {
        const gapBefore = i === 0 ? 0 : GAP
        const newTotal = total + gapBefore + widths[i]
        const isLast = i === widths.length - 1
        const needed = isLast ? newTotal : newTotal + GAP + moreWidth

        if (needed <= containerWidth) {
          count = i + 1
          total = newTotal
        } else {
          break
        }
      }

      setVisibleCount((prev) => (prev === count ? prev : count))
    }

    const measure = () => {
      // Measure tag widths when all tags are in DOM (visibleCount null → no tags hidden)
      const children = Array.from(el.children) as HTMLElement[]
      if (
        tagWidthsRef.current.length !== allTags.length &&
        children.length === allTags.length
      ) {
        tagWidthsRef.current = children.map((c) => c.offsetWidth)
      }
      recalculate(el.clientWidth)
    }

    measure()
    const ro = new ResizeObserver(() =>
      recalculate(containerRef.current?.clientWidth ?? 0),
    )
    ro.observe(el)
    return () => ro.disconnect()
  }, [expanded, allTags])

  const filtered =
    activeTags.length > 0
      ? posts.filter((p) =>
          p.metadata.tags?.some((t) => activeTags.includes(t)),
        )
      : posts

  const sorted = [...filtered].sort(
    (a, b) =>
      new Date(b.metadata.publishedAt).getTime() -
      new Date(a.metadata.publishedAt).getTime(),
  )

  const showMoreBtn =
    !expanded && visibleCount !== null && visibleCount < allTags.length
  const visibleTags = expanded
    ? allTags
    : visibleCount !== null
      ? allTags.slice(0, visibleCount)
      : allTags

  return (
    <div className="min-w-0">
      {allTags.length > 0 && (
        <div className="relative mb-6">
          {/* Hidden ··· button rendered off-layout solely to measure its width */}
          <button
            ref={moreBtnRef}
            className={`pointer-events-none invisible absolute ${MORE_BTN_CLASS}`}
            aria-hidden
            tabIndex={-1}
          >
            ···
          </button>

          <div
            ref={containerRef}
            className={`hide-scrollbar flex flex-nowrap gap-2 ${
              expanded
                ? 'overflow-x-auto'
                : visibleCount === null
                  ? 'overflow-hidden opacity-0'
                  : ''
            }`}
          >
            {visibleTags.map((tag) => (
              <TagPill
                key={tag}
                tag={tag}
                active={activeTags.includes(tag)}
                href={tagHref(tag, activeTags)}
              />
            ))}
            {showMoreBtn && (
              <button
                onClick={() => setExpanded(true)}
                className={`cursor-pointer transition-colors hover:bg-neutral-200 dark:hover:bg-neutral-700 ${MORE_BTN_CLASS}`}
              >
                ···
              </button>
            )}
            {expanded && (
              <button
                onClick={() => setExpanded(false)}
                className="shrink-0 cursor-pointer rounded-full px-2.5 py-0.5 text-xs whitespace-nowrap text-neutral-400 transition-colors hover:text-neutral-700 dark:hover:text-neutral-300"
              >
                show less
              </button>
            )}
          </div>
        </div>
      )}
      <div>
        {sorted.map((post) => (
          <Link
            key={post.slug}
            className="mb-4 flex flex-col space-y-1"
            href={`/blog/${post.slug}`}
          >
            <div className="flex w-full flex-col space-x-0 md:flex-row md:space-x-2">
              <p className="w-35 shrink-0 text-neutral-600 tabular-nums dark:text-neutral-400">
                {formatDate(post.metadata.publishedAt, false)}
              </p>
              <p className="tracking-tight text-neutral-900 dark:text-neutral-100">
                {post.metadata.title}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
