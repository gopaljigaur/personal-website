import { notFound } from 'next/navigation'
import { CustomMDX } from 'app/components/mdx'
import { Banner } from 'app/components/banner'
import { formatDate, getBlogPosts } from 'app/blog/utils'
import { baseUrl } from 'app/sitemap'
import Image from 'next/image'

export async function generateStaticParams() {
  let posts = getBlogPosts()
  if (!posts) {
    return []
  }
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export async function generateMetadata(props: { params: any }) {
  const params = await props.params;
  if (!params.slug) {
    notFound()
  }
  let post = getBlogPosts().find((post) => post.slug === params.slug)
  if (!post) {
    notFound();
  }

  let {
    title,
    publishedAt: publishedTime,
    summary: description,
    image,
  } = post.metadata
  let ogImage = image
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
      images: [
        {
          url: ogImage,
        },
      ],
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
  const params = await props.params;
  if (!params.slug) {
    notFound()
  }
  let post = getBlogPosts().find((post) => post.slug === params.slug)

  if (!post) {
    notFound()
  }

  return (
    <section>
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
            author: {
              '@type': 'Person',
              name: 'Gopalji Gaur',
            },
          }),
        }}
      />
      <Banner>blog</Banner>
      {
        post.metadata.image?
            <Image className="mb-8 rounded-xl"
                   src={post.metadata.image}
                   alt={post.metadata.title}
                   width={800}
                   height={400}
            ></Image> : ``
      }
      <h1 className="title font-semibold text-3xl mt-1 tracking-tighter text-black dark:text-white">
        {post.metadata.title}
      </h1>
      <div className="flex justify-between items-center mt-2 mb-14 text-sm">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {formatDate(post.metadata.publishedAt)}
        </p>
      </div>
      <article className="prose">
        <CustomMDX source={post.content} />
      </article>
    </section>
  )
}
