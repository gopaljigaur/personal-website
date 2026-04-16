import Link from 'next/link'
import type { BlogPost } from 'app/blog/utils.shared'
import { formatDate } from 'app/blog/utils.shared'

export function RelatedPosts({ posts }: { posts: BlogPost[] }) {
  if (posts.length === 0) return null

  return (
    <div className="mt-12 border-t border-neutral-200 pt-8 dark:border-neutral-800">
      <p className="mb-4 font-medium text-neutral-900 dark:text-neutral-100">
        Related posts
      </p>
      <ul className="space-y-3">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link
              href={`/blog/${post.slug}`}
              className="group flex flex-col transition-colors hover:text-neutral-900 dark:hover:text-neutral-100"
            >
              <span className="font-medium">{post.metadata.title}</span>
              <span className="text-sm text-neutral-500 dark:text-neutral-400">
                {formatDate(post.metadata.publishedAt)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
