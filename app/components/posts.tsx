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

export function BlogPostsWithFilter({
  posts,
  allTags,
  activeTags,
}: {
  posts: BlogPost[]
  allTags: string[]
  activeTags: string[]
}) {
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
          {allTags.map((tag) => (
            <TagPill
              key={tag}
              tag={tag}
              active={activeTags.includes(tag)}
              href={tagHref(tag, activeTags)}
            />
          ))}
          {activeTags.length > 0 && (
            <Link
              href="/blog"
              className="shrink-0 rounded-full px-2.5 py-0.5 text-xs whitespace-nowrap text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
            >
              clear all
            </Link>
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
              <p className="w-35 shrink-0 text-neutral-600 tabular-nums dark:text-neutral-400">
                {formatDate(post.metadata.publishedAt, false)}
              </p>
              <p className="text-primary-inv tracking-tight">
                {post.metadata.title}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
