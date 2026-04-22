import { Suspense } from 'react'
import { BlogPostsWithFilter } from 'app/components/posts'
import { getBlogPosts } from 'app/blog/utils'

export const metadata = {
  title: 'Blog',
  description: 'Read my blog.',
}

export default function Page() {
  const posts = getBlogPosts()

  const tagFrequency = posts.reduce(
    (acc, p) => {
      p.metadata.tags?.forEach((t) => {
        acc[t] = (acc[t] ?? 0) + 1
      })
      return acc
    },
    {} as Record<string, number>,
  )

  const allTags = [
    ...new Set(posts.flatMap((p) => p.metadata.tags ?? [])),
  ].sort((a, b) => (tagFrequency[b] ?? 0) - (tagFrequency[a] ?? 0))

  return (
    <Suspense>
      <BlogPostsWithFilter posts={posts} allTags={allTags} />
    </Suspense>
  )
}
