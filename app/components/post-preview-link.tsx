'use client'

import Link from 'next/link'
import Image from 'next/image'
import { formatDate } from 'app/blog/utils.shared'
import { usePreviewCard, PreviewCardPortal } from './use-preview-card'

type PreviewPost = {
  title: string
  publishedAt: string
  image?: string
  tags?: string[]
}

export function PostPreviewLink({
  href,
  post,
  children,
  className,
}: {
  href: string
  post: PreviewPost
  children: React.ReactNode
  className?: string
}) {
  const { ref, pos, visible, mounted, onMouseEnter, onMouseLeave } =
    usePreviewCard(272)

  return (
    <>
      <Link
        ref={ref}
        href={href}
        className={className}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {children}
      </Link>
      <PreviewCardPortal
        pos={pos}
        visible={visible}
        mounted={mounted}
        width={272}
      >
        {post.image && (
          <Image
            src={post.image}
            alt={post.title}
            width={272}
            height={136}
            className="rounded-t-xl object-cover"
          />
        )}
        <div className="p-3">
          <span className="block text-sm font-medium text-neutral-900 dark:text-neutral-100">
            {post.title}
          </span>
          <span className="mt-1 block text-xs text-neutral-500">
            {formatDate(post.publishedAt, false)}
          </span>
          {post.tags && post.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </PreviewCardPortal>
    </>
  )
}
