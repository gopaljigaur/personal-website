'use client'

import { useState } from 'react'
import { LuArrowRight, LuCheck } from 'react-icons/lu'

export function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle')

  async function subscribe(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      setStatus(res.ok ? 'success' : 'error')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
        <LuCheck size={14} className="text-green-500" />
        You&apos;re subscribed. I&apos;ll reach out when something new drops.
      </div>
    )
  }

  return (
    <form onSubmit={subscribe} className="flex gap-2">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        className="min-w-0 flex-1 rounded-md border border-neutral-200 bg-white px-3 py-1.5 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:border-neutral-500"
      />
      <button
        type="submit"
        disabled={status === 'loading'}
        className="flex cursor-pointer items-center gap-1.5 rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900"
      >
        {status === 'loading' ? (
          'Subscribing…'
        ) : (
          <>
            Subscribe <LuArrowRight size={13} />
          </>
        )}
      </button>
      {status === 'error' && (
        <p className="mt-1 text-xs text-red-500">
          Something went wrong. Try again.
        </p>
      )}
    </form>
  )
}
