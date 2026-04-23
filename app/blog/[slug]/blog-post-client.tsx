'use client'

import React, { useMemo, useRef, useLayoutEffect } from 'react'
import { useTina } from 'tinacms/dist/react'
import { TinaMarkdown } from 'tinacms/dist/rich-text'
import Image from 'next/image'
import Link from 'next/link'
import { TagPill } from 'app/components/tag-pill'
import Comments from 'app/components/comments'
import { TableOfContents } from 'app/components/toc'
import { RelatedPosts } from 'app/components/related-posts'
import { formatDate, slugify } from 'app/blog/utils.shared'
import { Code, GistCode } from 'app/components/code'
import { VibeSimulator } from 'app/components/vibe-simulator'
import { Callout } from 'app/components/callout'
import { StatCallout } from 'app/components/stat-callout'
import { LabeledCode } from 'app/components/labeled-code'
import { ToolDescriptionGrader } from 'app/components/tool-description-grader'
import { ToolScaleSimulator } from 'app/components/tool-scale-simulator'
import { VerbosityBiasDemo } from 'app/components/verbosity-bias-demo'
import { EvalCoverageMatrix } from 'app/components/eval-coverage-matrix'
import { ConsistencyTradeoffExplorer } from 'app/components/consistency-tradeoff-explorer'
import { BenchmarkBlindspots } from 'app/components/benchmark-blindspots'
import { LinkPreview } from 'app/components/link-preview'
import { PostPreviewLink } from 'app/components/post-preview-link'
import type { BlogPost, Heading } from 'app/blog/utils.shared'

const baseUrl = 'https://gopalji.me'

function createHeading(level: number) {
  const Heading = ({ children }: { children: React.ReactNode }) => {
    const ref = useRef<HTMLHeadingElement>(null)

    useLayoutEffect(() => {
      const el = ref.current
      if (!el) return
      const slug = slugify(el.textContent ?? '')
      el.id = slug
      const anchor = el.querySelector('a.anchor')
      if (anchor) anchor.setAttribute('href', `#${slug}`)
    }, [])

    return React.createElement(`h${level}`, { ref }, [
      React.createElement('a', { key: 'anchor', className: 'anchor' }),
      children,
    ])
  }
  Heading.displayName = `H${level}`
  return Heading
}

function extractHeadingsFromBody(
  body: Record<string, unknown> | null | undefined,
): Heading[] {
  if (!body?.children || !Array.isArray(body.children)) return []
  const headings: Heading[] = []
  for (const child of body.children as Record<string, unknown>[]) {
    if (typeof child?.type === 'string' && /^h[2-4]$/.test(child.type)) {
      const level = parseInt(child.type[1])
      const childNodes = Array.isArray(child.children) ? child.children : []
      const text = (childNodes as Record<string, unknown>[])
        .map((c) => (typeof c.text === 'string' ? c.text : ''))
        .join('')
      if (text) headings.push({ level, text, id: slugify(text) })
    }
  }
  return headings
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const baseTinaComponents: Record<string, any> = {
  ...Object.fromEntries(
    Array.from({ length: 6 }, (_, i) => [`h${i + 1}`, createHeading(i + 1)]),
  ),
  img: ({ url, alt }: { url: string; alt?: string }) => (
    <Image
      src={url}
      alt={alt ?? ''}
      width={800}
      height={400}
      className="rounded-lg"
    />
  ),
  code_block: ({ lang, value }: { lang?: string; value: string }) => (
    <pre>
      <Code language={lang}>{value}</Code>
    </pre>
  ),
  VibeSimulator: () => <VibeSimulator />,
  Callout: ({
    type,
    content,
  }: {
    type?: 'note' | 'warning' | 'tip'
    content?: string
  }) => <Callout type={type}>{content}</Callout>,
  GistCode: ({ url }: { url: string }) => <GistCode url={url} />,
  StatCallout: ({
    stat,
    label,
    source,
    sourceUrl,
  }: {
    stat: string
    label: string
    source?: string
    sourceUrl?: string
  }) => (
    <StatCallout
      stat={stat}
      label={label}
      source={source}
      sourceUrl={sourceUrl}
    />
  ),
  LabeledCode: ({
    type,
    label,
  }: {
    type?: 'good' | 'bad' | 'note'
    label: string
  }) => <LabeledCode type={type} label={label} />,
  ToolDescriptionGrader: () => <ToolDescriptionGrader />,
  ToolScaleSimulator: () => <ToolScaleSimulator />,
  VerbosityBiasDemo: () => <VerbosityBiasDemo />,
  EvalCoverageMatrix: () => <EvalCoverageMatrix />,
  ConsistencyTradeoffExplorer: () => <ConsistencyTradeoffExplorer />,
  BenchmarkBlindspots: () => <BenchmarkBlindspots />,
}

interface BlogPostClientProps {
  query: string
  variables: { relativePath: string }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any
  related: BlogPost[]
  slug: string
  allPosts: BlogPost[]
}

export default function BlogPostClient({
  query,
  variables,
  data,
  related,
  slug,
  allPosts,
}: BlogPostClientProps) {
  const { data: tinaData } = useTina({ query, variables, data })
  const post = tinaData.blog

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tinaComponents: Record<string, any> = useMemo(
    () => ({
      ...baseTinaComponents,
      a: ({ url, children }: { url: string; children: React.ReactNode }) => {
        if (url?.startsWith('/blog/') && url.split('/').length === 3) {
          const linkedPost = allPosts.find((p) => url === `/blog/${p.slug}`)
          return (
            <PostPreviewLink
              href={url}
              post={
                linkedPost
                  ? {
                      title: linkedPost.metadata.title,
                      publishedAt: linkedPost.metadata.publishedAt,
                      image: linkedPost.metadata.image,
                      tags: linkedPost.metadata.tags,
                    }
                  : { title: String(children), publishedAt: '' }
              }
            >
              {children}
            </PostPreviewLink>
          )
        }
        if (url?.startsWith('/')) return <Link href={url}>{children}</Link>
        if (url?.startsWith('#')) return <a href={url}>{children}</a>
        if (url?.startsWith('http'))
          return <LinkPreview href={url}>{children}</LinkPreview>
        return (
          <a href={url} target="_blank" rel="noopener noreferrer">
            {children}
          </a>
        )
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }),
    [allPosts],
  )
  const headings = useMemo(
    () => extractHeadingsFromBody(post.body),
    [post.body],
  )

  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post.title,
            datePublished: post.publishedAt,
            dateModified: post.publishedAt,
            description: post.summary,
            image: post.image
              ? `${baseUrl}${post.image}`
              : `/og?title=${encodeURIComponent(post.title)}`,
            url: `${baseUrl}/blog/${slug}`,
            author: { '@type': 'Person', name: 'Gopalji Gaur' },
          }),
        }}
      />
      {post.image && (
        <Image
          className="mb-8 rounded-xl"
          src={post.image}
          alt={post.title}
          width={800}
          height={400}
        />
      )}
      <h1 className="title mt-1 text-3xl font-semibold tracking-tighter text-black dark:text-white">
        {post.title}
      </h1>
      <div className="mt-2 mb-6 flex flex-wrap items-center gap-3 text-sm">
        <p className="text-secondary-inv">{formatDate(post.publishedAt)}</p>
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {(post.tags.filter(Boolean) as string[]).map((tag) => (
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
      <div className="mb-10 xl:hidden">
        <TableOfContents headings={headings} />
      </div>
      <div className="relative">
        <div className="absolute top-0 left-full ml-8 hidden h-full w-56 xl:block">
          <div className="sticky top-20">
            <TableOfContents headings={headings} />
          </div>
        </div>
        <article className="prose">
          <TinaMarkdown content={post.body} components={tinaComponents} />
        </article>
      </div>
      <RelatedPosts posts={related} />
      <Comments />
    </>
  )
}
