'use client'

import Link from 'next/link'
import { useState } from 'react'
import { TagPill } from 'app/components/tag-pill'
import { formatDate } from 'app/blog/utils.shared'
import type { BlogPost } from 'app/blog/utils.shared'

const TOP_N = 6

function tagHref(tag: string, activeTags: string[]) {
  const next = activeTags.includes(tag)
    ? activeTags.filter((t) => t !== tag)
    : [...activeTags, tag]
  return next.length === 0
    ? '/blog'
    : `/blog?tags=${next.map(encodeURIComponent).join(',')}`
}

export function BlogPosts({ posts }: { posts: BlogPost[] }) {
  return (
    <div>
      {posts
        .sort(
          (a, b) =>
            new Date(b.metadata.publishedAt).getTime() -
            new Date(a.metadata.publishedAt).getTime(),
        )
        .map((post) => (
          <Link
            key={post.slug}
            className="mb-4 flex flex-col space-y-1"
            href={`/blog/${post.slug}`}
          >
            <div className="flex w-full flex-col space-x-0 md:flex-row md:space-x-2">
              <p className="w-[140px] text-neutral-600 tabular-nums dark:text-neutral-400">
                {formatDate(post.metadata.publishedAt, false)}
              </p>
              <p className="tracking-tight text-neutral-900 dark:text-neutral-100">
                {post.metadata.title}
              </p>
            </div>
          </Link>
        ))}
    </div>
  )
}

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

  const visibleTags = expanded ? allTags : allTags.slice(0, TOP_N)
  const hasMore = allTags.length > TOP_N

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

  return (
    <div>
      {allTags.length > 0 && (
        <div className="hide-scrollbar mb-6 flex items-center gap-2 overflow-x-auto">
          {visibleTags.map((tag) => (
            <TagPill
              key={tag}
              tag={tag}
              active={activeTags.includes(tag)}
              href={tagHref(tag, activeTags)}
            />
          ))}
          {hasMore && !expanded && (
            <button
              onClick={() => setExpanded(true)}
              className="shrink-0 cursor-pointer rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs text-neutral-600 transition-colors hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
            >
              ···
            </button>
          )}
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
              <p className="w-[140px] shrink-0 text-neutral-600 tabular-nums dark:text-neutral-400">
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
