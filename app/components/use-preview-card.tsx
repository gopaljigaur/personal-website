'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'

type Pos = { x: number; y: number; placement: 'above' | 'below' }

const CARD_HEIGHT_ESTIMATE = 280

export function usePreviewCard(cardWidth: number) {
  const [pos, setPos] = useState<Pos>({ x: 0, y: 0, placement: 'above' })
  const [visible, setVisible] = useState(false)
  const [mounted, setMounted] = useState(false)
  const ref = useRef<HTMLAnchorElement>(null)
  const showTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const hide = () => {
      if (showTimer.current) {
        clearTimeout(showTimer.current)
        showTimer.current = null
      }
      setVisible(false)
    }
    window.addEventListener('scroll', hide, { passive: true })
    return () => window.removeEventListener('scroll', hide)
  }, [])

  const onMouseEnter = () => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect()
      const gap = 8
      const x = Math.max(
        8,
        Math.min(
          rect.left + rect.width / 2 - cardWidth / 2,
          window.innerWidth - cardWidth - 8,
        ),
      )
      const hasSpaceAbove = rect.top > CARD_HEIGHT_ESTIMATE + gap
      setPos(
        hasSpaceAbove
          ? { x, y: window.innerHeight - rect.top + gap, placement: 'above' }
          : { x, y: rect.bottom + gap, placement: 'below' },
      )
    }
    showTimer.current = setTimeout(() => setVisible(true), 1000)
  }

  const onMouseLeave = () => {
    if (showTimer.current) {
      clearTimeout(showTimer.current)
      showTimer.current = null
    }
    setVisible(false)
  }

  return { ref, pos, visible, mounted, onMouseEnter, onMouseLeave }
}

export function PreviewCardPortal({
  pos,
  visible,
  mounted,
  width,
  children,
}: {
  pos: Pos
  visible: boolean
  mounted: boolean
  width: number
  children: React.ReactNode
}) {
  if (!mounted) return null
  const style =
    pos.placement === 'above'
      ? { left: pos.x, bottom: pos.y, width }
      : { left: pos.x, top: pos.y, width }
  return createPortal(
    <div
      style={style}
      className={`pointer-events-none fixed z-50 hidden rounded-xl border border-neutral-200 bg-white shadow-xl transition-[opacity] duration-150 md:block dark:border-neutral-800 dark:bg-neutral-950 ${visible ? 'opacity-100' : 'opacity-0'}`}
    >
      {children}
    </div>,
    document.body,
  )
}
