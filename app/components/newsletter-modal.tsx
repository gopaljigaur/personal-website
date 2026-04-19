'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { LuX } from 'react-icons/lu'
import { NewsletterForm } from 'app/components/newsletter-form'

const DISMISSED_KEY = 'newsletter_dismissed'

export function NewsletterModal() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handler = () => setOpen(true)
    window.addEventListener('openNewsletter', handler)
    return () => window.removeEventListener('openNewsletter', handler)
  }, [])

  // Auto-open on homepage once (if not previously dismissed)
  useEffect(() => {
    if (pathname !== '/') return
    if (localStorage.getItem(DISMISSED_KEY)) return
    const t = setTimeout(() => setOpen(true), 800)
    return () => clearTimeout(t)
  }, [pathname])

  function dismiss() {
    localStorage.setItem(DISMISSED_KEY, '1')
    setOpen(false)
  }

  if (!open) return null

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
        onClick={dismiss}
      />
      <div className="fixed inset-x-4 bottom-6 z-50 mx-auto max-w-md rounded-xl border border-neutral-200 bg-white p-6 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900">
        <button
          onClick={dismiss}
          aria-label="Dismiss newsletter"
          className="absolute top-3 right-3 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
        >
          <LuX size={14} />
        </button>
        <p className="mb-1 text-sm font-medium text-neutral-800 dark:text-neutral-200">
          Stay in the loop
        </p>
        <p className="text-muted-inv mb-4 text-sm">
          Get notified when I publish new posts or projects.
        </p>
        <NewsletterForm onSuccess={dismiss} />
      </div>
    </>
  )
}
