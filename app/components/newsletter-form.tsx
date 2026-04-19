'use client'

import { useState } from 'react'
import { LuArrowRight, LuCheck } from 'react-icons/lu'

export function NewsletterForm({ onSuccess }: { onSuccess?: () => void } = {}) {
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
      if (res.ok) {
        setStatus('success')
        onSuccess?.()
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="text-secondary-inv flex items-center gap-2 text-sm">
        <LuCheck size={14} className="text-green-500" />
        You&apos;re subscribed. I&apos;ll reach out when something new drops.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1.5">
      <form onSubmit={subscribe} className="flex gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            if (status === 'error') setStatus('idle')
          }}
          placeholder="your@email.com"
          className={`min-w-0 flex-1 rounded-md border px-3 py-1.5 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 dark:text-neutral-100 ${
            status === 'error'
              ? 'border-red-400 bg-red-50 focus:border-red-500 dark:border-red-700 dark:bg-red-950/30 dark:focus:border-red-600'
              : 'border-neutral-200 bg-white focus:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-neutral-500'
          }`}
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="flex cursor-pointer items-center gap-1.5 rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900"
        >
          Subscribe{' '}
          {status === 'loading' ? (
            <span className="flex items-center gap-0.5">
              <span className="h-1 w-1 animate-bounce rounded-full bg-current [animation-delay:-0.3s]" />
              <span className="h-1 w-1 animate-bounce rounded-full bg-current [animation-delay:-0.15s]" />
              <span className="h-1 w-1 animate-bounce rounded-full bg-current" />
            </span>
          ) : (
            <LuArrowRight size={13} />
          )}
        </button>
      </form>
      {status === 'error' && (
        <p className="text-xs text-red-500">Something went wrong. Try again.</p>
      )}
    </div>
  )
}
