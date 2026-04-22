'use client'

import { useState, useEffect } from 'react'
import { TagPill } from 'app/components/tag-pill'
import { PostPreviewLink } from 'app/components/post-preview-link'
import { formatDate } from 'app/blog/utils.shared'
import type { BlogPost } from 'app/blog/utils.shared'

function tagUrl(tags: string[]) {
  return tags.length
    ? `/blog?tags=${tags.map(encodeURIComponent).join(',')}`
    : '/blog'
}

export function BlogPostsWithFilter({
  posts,
  allTags,
}: {
  posts: BlogPost[]
  allTags: string[]
}) {
  const [activeTags, setActiveTags] = useState<string[]>([])

  useEffect(() => {
    const tagsParam =
      new URLSearchParams(window.location.search).get('tags') ?? ''
    if (tagsParam) {
      setActiveTags(
        tagsParam
          .split(',')
          .map((t) => decodeURIComponent(t.trim()))
          .filter(Boolean),
      )
    }
  }, [])

  const toggleTag = (e: React.MouseEvent, tag: string) => {
    e.preventDefault()
    const next = activeTags.includes(tag)
      ? activeTags.filter((t) => t !== tag)
      : [...activeTags, tag]
    setActiveTags(next)
    window.history.replaceState({}, '', tagUrl(next))
  }

  const clearAll = (e: React.MouseEvent) => {
    e.preventDefault()
    setActiveTags([])
    window.history.replaceState({}, '', '/blog')
  }

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
    <div className="min-w-0">
      {allTags.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {allTags.map((tag) => {
            const next = activeTags.includes(tag)
              ? activeTags.filter((t) => t !== tag)
              : [...activeTags, tag]
            return (
              <TagPill
                key={tag}
                tag={tag}
                active={activeTags.includes(tag)}
                href={tagUrl(next)}
                onClick={(e) => toggleTag(e, tag)}
              />
            )
          })}
          {activeTags.length > 0 && (
            <button
              onClick={clearAll}
              className="shrink-0 rounded-full px-2.5 py-0.5 text-xs whitespace-nowrap text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
            >
              clear all
            </button>
          )}
        </div>
      )}
      <div>
        {sorted.map((post) => (
          <PostPreviewLink
            key={post.slug}
            href={`/blog/${post.slug}`}
            post={{
              title: post.metadata.title,
              publishedAt: post.metadata.publishedAt,
              image: post.metadata.image,
              tags: post.metadata.tags,
            }}
            className="mb-4 flex flex-col space-y-1"
          >
            <div className="flex w-full flex-col space-x-0 md:flex-row md:space-x-2">
              <p className="w-40 shrink-0 whitespace-nowrap text-neutral-600 tabular-nums dark:text-neutral-400">
                {formatDate(post.metadata.publishedAt, false)}
              </p>
              <p className="text-primary-inv tracking-tight">
                {post.metadata.title}
              </p>
            </div>
          </PostPreviewLink>
        ))}
      </div>
    </div>
  )
}
