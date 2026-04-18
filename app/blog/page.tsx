import { BlogPostsWithFilter } from 'app/components/posts'
import { getBlogPosts } from 'app/blog/utils'

export const metadata = {
  title: 'Blog',
  description: 'Read my blog.',
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export default async function Page(props: { searchParams: any }) {
  const searchParams = await props.searchParams
  const tagsParam: string = searchParams?.tags ?? ''
  const activeTags = tagsParam
    ? tagsParam
        .split(',')
        .map((t: string) => decodeURIComponent(t.trim()))
        .filter(Boolean)
    : []

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
  ].sort((a, b) => {
    const aActive = activeTags.includes(a) ? 1 : 0
    const bActive = activeTags.includes(b) ? 1 : 0
    if (bActive !== aActive) return bActive - aActive
    return (tagFrequency[b] ?? 0) - (tagFrequency[a] ?? 0)
  })

  return (
    <BlogPostsWithFilter
      posts={posts}
      allTags={allTags}
      activeTags={activeTags}
    />
  )
}
