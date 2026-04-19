'use client'

import { useEffect, useRef, useState } from 'react'
import { LuX } from 'react-icons/lu'
import { NewsletterForm } from 'app/components/newsletter-form'

const DISMISSED_KEY = 'newsletter_dismissed'
const HIGHLIGHT_KEY = 'newsletter_highlight'

export function NewsletterSection() {
  const [visible, setVisible] = useState(false)
  const [highlighted, setHighlighted] = useState(false)
  const [pendingHighlight, setPendingHighlight] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)

  const highlight = () => {
    setHighlighted(true)
    sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  useEffect(() => {
    setVisible(!localStorage.getItem(DISMISSED_KEY))

    if (sessionStorage.getItem(HIGHLIGHT_KEY)) {
      sessionStorage.removeItem(HIGHLIGHT_KEY)
      localStorage.removeItem(DISMISSED_KEY)
      setVisible(true)
      setPendingHighlight(true)
    }

    const handler = () => {
      localStorage.removeItem(DISMISSED_KEY)
      setVisible(true)
      highlight()
    }
    window.addEventListener('openNewsletter', handler)
    return () => window.removeEventListener('openNewsletter', handler)
  }, [])

  useEffect(() => {
    if (!pendingHighlight || !sectionRef.current) return
    const el = sectionRef.current
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          observer.disconnect()
          setPendingHighlight(false)
          requestAnimationFrame(highlight)
        }
      },
      { threshold: 0.3 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [pendingHighlight, visible])

  if (!visible) return null

  return (
    <div
      ref={sectionRef}
      onClick={() => setHighlighted(false)}
      className="relative mt-8"
    >
      {highlighted && (
        <div className="from-light-primary/70 to-light-secondary/70 dark:from-dark-primary/70 dark:to-dark-secondary/70 pointer-events-none absolute -inset-[3px] rounded-[15px] bg-gradient-to-br transition-opacity duration-500" />
      )}
      <div className="bg-light-background dark:bg-dark-background relative rounded-xl px-6 py-6">
        {/* subtle tint overlay — on top of solid bg so the border gradient doesn't bleed through */}
        <div className="bg-brand-tint pointer-events-none absolute inset-0 rounded-xl" />
        <div className="relative">
          <button
            onClick={() => {
              localStorage.setItem(DISMISSED_KEY, '1')
              setVisible(false)
              window.dispatchEvent(new Event('newsletterDismissed'))
            }}
            aria-label="Dismiss newsletter"
            className="absolute top-0 right-0 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
          >
            <LuX size={13} />
          </button>
          <p className="mb-1 text-sm font-medium text-neutral-800 dark:text-neutral-200">
            Stay in the loop
          </p>
          <p className="text-muted-inv mb-4 text-sm">
            Get notified when I publish new posts or projects.
          </p>
          <NewsletterForm />
        </div>
      </div>
    </div>
  )
}
