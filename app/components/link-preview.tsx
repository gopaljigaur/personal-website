'use client'

import { useState, useEffect } from 'react'
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
const inFlight = new Set<string>()

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
  const [data, setData] = useState<OgData | null>(
    () => ogCache.get(href) ?? null,
  )
  const [imageVisible, setImageVisible] = useState(false)

  const domain = (() => {
    try {
      return new URL(href).hostname.replace(/^www\./, '')
    } catch {
      return href
    }
  })()
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`

  // Reset image fade when card hides
  useEffect(() => {
    if (!visible) setImageVisible(false)
  }, [visible])

  // Fade image in after expand
  useEffect(() => {
    if (data?.image) {
      const t = setTimeout(() => setImageVisible(true), 200)
      return () => clearTimeout(t)
    }
  }, [data])

  // Fetch OG data 1s after card shows
  useEffect(() => {
    if (!visible) return
    const t = setTimeout(async () => {
      if (ogCache.has(href)) {
        setData(ogCache.get(href)!)
        return
      }
      if (inFlight.has(href)) return
      inFlight.add(href)
      try {
        const res = await fetch(
          `/api/og-preview?url=${encodeURIComponent(href)}`,
        )
        if (res.ok) {
          const d: OgData = await res.json()
          ogCache.set(href, d)
          setData(d)
        }
      } catch {
      } finally {
        inFlight.delete(href)
      }
    }, 1000)
    return () => clearTimeout(t)
  }, [visible, href])

  const hasContent = !!(data?.image || data?.title || data?.description)

  return (
    <>
      <a
        ref={ref}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
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
          className="overflow-hidden transition-[max-height] duration-200 ease-out"
          style={{ maxHeight: hasContent ? '400px' : '0px' }}
        >
          {data?.image && (
            <div
              className={`relative h-36 w-full overflow-hidden rounded-t-xl transition-opacity duration-300 ${imageVisible ? 'opacity-100' : 'opacity-0'}`}
            >
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
            <div className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
              <Image
                src={data?.favicon ?? faviconUrl}
                alt=""
                width={14}
                height={14}
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
