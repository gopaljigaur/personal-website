'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { usePreviewCard, PreviewCardPortal } from './use-preview-card'

type OgData = {
  title: string | null
  description: string | null
  image: string | null
  domain: string
  favicon: string
}

const ogCache = new Map<string, OgData>()

export function LinkPreview({
  href,
  children,
  className,
}: {
  href: string
  children: React.ReactNode
  className?: string
}) {
  const { ref, pos, visible, mounted, onMouseEnter, onMouseLeave } =
    usePreviewCard(288)
  const [hovered, setHovered] = useState(false)
  const [data, setData] = useState<OgData | null>(
    () => ogCache.get(href) ?? null,
  )
  const [showImage, setShowImage] = useState(false)
  const imageTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const domain = (() => {
    try {
      return new URL(href).hostname.replace(/^www\./, '')
    } catch {
      return href
    }
  })()
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`

  // Fetch OG data immediately on hover so it's ready when card opens
  useEffect(() => {
    if (!hovered) return
    if (ogCache.has(href)) {
      setData(ogCache.get(href)!)
      return
    }
    let cancelled = false
    fetch(`/api/og-preview?url=${encodeURIComponent(href)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((d: OgData | null) => {
        if (!cancelled && d) {
          ogCache.set(href, d)
          setData(d)
        }
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [hovered, href])

  // Show image section 2s after hover start
  useEffect(() => {
    if (hovered) {
      imageTimer.current = setTimeout(() => setShowImage(true), 2000)
    } else {
      if (imageTimer.current) clearTimeout(imageTimer.current)
      setShowImage(false)
    }
    return () => {
      if (imageTimer.current) clearTimeout(imageTimer.current)
    }
  }, [hovered])

  const hasText = !!(data?.title || data?.description)
  const hasImage = !!(showImage && data?.image)

  return (
    <>
      <a
        ref={ref}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        onMouseEnter={() => {
          setHovered(true)
          onMouseEnter()
        }}
        onMouseLeave={() => {
          setHovered(false)
          onMouseLeave()
        }}
      >
        {children}
      </a>
      <PreviewCardPortal
        pos={pos}
        visible={visible}
        mounted={mounted}
        width={288}
      >
        <div
          className="overflow-hidden transition-[max-height] duration-300 ease-out"
          style={{ maxHeight: hasImage ? '400px' : '0px' }}
        >
          {data?.image && (
            <div className="relative h-36 w-full overflow-hidden rounded-t-xl">
              <Image
                src={data.image}
                alt={data.title ?? ''}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          )}
          <div className="px-3 pt-3">
            {data?.title && (
              <span className="block text-sm font-medium text-neutral-900 dark:text-neutral-100">
                {data.title}
              </span>
            )}
            {data?.description && (
              <span className="mt-1 line-clamp-2 block text-xs text-neutral-500">
                {data.description}
              </span>
            )}
          </div>
        </div>
        <div className="p-3">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 shrink-0 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
              <Image
                src={data?.favicon ?? faviconUrl}
                alt=""
                width={24}
                height={24}
                className="h-full w-full object-cover"
                unoptimized
              />
            </div>
            <span className="text-xs text-neutral-400">
              {data?.domain ?? domain}
            </span>
          </div>
        </div>
      </PreviewCardPortal>
    </>
  )
}
