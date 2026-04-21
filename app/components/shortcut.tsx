'use client'

import { useEffect, useState } from 'react'

type Props = {
  combo: string | string[]
  className?: string
}

export function Shortcut({ combo, className = '' }: Props) {
  const [modifier, setModifier] = useState<string | null>(null)

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return
    const isMac =
      /mac/i.test(navigator.platform) || /mac/i.test(navigator.userAgent)
    setModifier(isMac ? '⌘' : 'Ctrl')
  }, [])

  const keys = [modifier ?? '⌘', ...(Array.isArray(combo) ? combo : [combo])]

  return (
    <span
      className={`inline-flex items-center gap-0.5 transition-opacity duration-150 ${modifier ? 'opacity-100' : 'opacity-0'} ${className}`}
    >
      {keys.map((k) => (
        <kbd
          key={k}
          className="rounded border border-neutral-300 bg-transparent px-1.5 py-0.5 text-[13px] leading-none font-medium text-neutral-500 dark:border-neutral-50/15 dark:text-neutral-300"
        >
          {k}
        </kbd>
      ))}
    </span>
  )
}
