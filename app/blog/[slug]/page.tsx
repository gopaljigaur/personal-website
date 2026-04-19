import { notFound } from 'next/navigation'
import Image from 'next/image'
import { CustomMDX } from 'app/components/mdx'
import { TagPill } from 'app/components/tag-pill'
import Comments from 'app/components/comments'
import { TableOfContents } from 'app/components/toc'
import { RelatedPosts } from 'app/components/related-posts'
import { getBlogPosts, extractHeadings, getRelatedPosts } from 'app/blog/utils'
import { formatDate } from 'app/blog/utils.shared'
import { baseUrl } from 'app/sitemap'
import BlogPostClient from './blog-post-client'

export async function generateStaticParams() {
  return getBlogPosts().map((post) => ({ slug: post.slug }))
}

/* eslint-disable  @typescript-eslint/no-explicit-any */
export async function generateMetadata(props: { params: any }) {
  const params = await props.params
  const post = getBlogPosts().find((p) => p.slug === params.slug)
  if (!post) notFound()

  const {
    title,
    publishedAt: publishedTime,
    summary: description,
    image,
  } = post.metadata
  const ogImage = image
    ? image
    : `${baseUrl}/og?title=${encodeURIComponent(title)}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime,
      url: `${baseUrl}/blog/${post.slug}`,
      images: [{ url: ogImage }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  }
}

export default async function Blog(props: { params: any }) {
  const params = await props.params
  const allPosts = getBlogPosts()
  const post = allPosts.find((p) => p.slug === params.slug)
  if (!post) notFound()

  const related = getRelatedPosts(post.slug, post.metadata.tags ?? [], allPosts)

  if (process.env.NODE_ENV === 'development') {
    try {
      const { client } = await import('../../../tina/__generated__/client')
      const tinaData = await client.queries.blog({
        relativePath: `${params.slug}.mdx`,
      })
      return (
        <BlogPostClient
          query={tinaData.query}
          variables={tinaData.variables}
          data={tinaData.data}
          related={related}
          slug={params.slug}
        />
      )
    } catch {
      // TinaCMS server not running — fall through to static rendering
    }
  }

  // Production fallback: static server-side rendering
  const headings = extractHeadings(post.content)

  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post.metadata.title,
            datePublished: post.metadata.publishedAt,
            dateModified: post.metadata.publishedAt,
            description: post.metadata.summary,
            image: post.metadata.image
              ? `${baseUrl}${post.metadata.image}`
              : `/og?title=${encodeURIComponent(post.metadata.title)}`,
            url: `${baseUrl}/blog/${post.slug}`,
            author: { '@type': 'Person', name: 'Gopalji Gaur' },
          }),
        }}
      />
      {post.metadata.image && (
        <Image
          className="mb-8 rounded-xl"
          src={post.metadata.image}
          alt={post.metadata.title}
          width={800}
          height={400}
        />
      )}
      <h1 className="title mt-1 text-3xl font-semibold tracking-tighter text-black dark:text-white">
        {post.metadata.title}
      </h1>
      <div className="mt-2 mb-6 flex flex-wrap items-center gap-3 text-sm">
        <p className="text-neutral-600 dark:text-neutral-400">
          {formatDate(post.metadata.publishedAt)}
        </p>
        {post.metadata.tags && post.metadata.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {post.metadata.tags.map((tag) => (
              <TagPill
                key={tag}
                tag={tag}
                active={false}
                href={`/blog?tags=${encodeURIComponent(tag)}`}
              />
            ))}
          </div>
        )}
      </div>
      {/* Inline TOC on smaller screens */}
      <div className="mb-10 xl:hidden">
        <TableOfContents headings={headings} />
      </div>
      {/* Article with sticky sidebar TOC on xl+ screens */}
      <div className="relative">
        <div className="absolute top-0 left-full ml-8 hidden h-full w-56 xl:block">
          <div className="sticky top-20">
            <TableOfContents headings={headings} />
          </div>
        </div>
        <article className="prose">
          <CustomMDX source={post.content} />
        </article>
      </div>
      <RelatedPosts posts={related} />
      <Comments />
    </>
  )
}
