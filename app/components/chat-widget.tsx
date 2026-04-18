'use client'

import { memo, useEffect, useRef, useState } from 'react'
import {
  LuMessageSquare,
  LuX,
  LuSendHorizontal,
  LuRotateCcw,
  LuSparkles,
} from 'react-icons/lu'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

type Message = { role: 'user' | 'assistant'; content: string }

function ThinkingDots() {
  return (
    <span className="flex items-center gap-1 py-0.5">
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.3s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.15s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current" />
    </span>
  )
}

const MessageContent = memo(function MessageContent({
  text,
}: {
  text: string
}) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        a: ({ href, children }) => (
          <a
            href={href}
            target={href?.startsWith('mailto:') ? undefined : '_blank'}
            rel="noopener noreferrer"
            className="underline"
          >
            {children}
          </a>
        ),
        p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
        ul: ({ children }) => <ul className="ml-4 list-disc">{children}</ul>,
        ol: ({ children }) => <ol className="ml-4 list-decimal">{children}</ol>,
        li: ({ children }) => <li className="mt-0.5">{children}</li>,
        code: ({ children }) => (
          <code className="rounded bg-neutral-200 px-1 font-mono text-xs dark:bg-neutral-700">
            {children}
          </code>
        ),
      }}
    >
      {text}
    </ReactMarkdown>
  )
})

export function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50)
  }, [open])

  useEffect(() => {
    const onKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKeydown)
    return () => window.removeEventListener('keydown', onKeydown)
  }, [])

  async function send() {
    const text = input.trim()
    if (!text || loading) return
    setInput('')

    const userMsg: Message = { role: 'user', content: text }
    const nextMessages = [...messages, userMsg]
    setMessages(nextMessages)
    setLoading(true)

    setMessages((prev) => [...prev, { role: 'assistant', content: '' }])

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }],
          })),
        }),
      })

      if (!res.ok || !res.body) throw new Error('Request failed')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        setMessages((prev) => {
          const updated = [...prev]
          updated[updated.length - 1] = {
            role: 'assistant',
            content: updated[updated.length - 1].content + chunk,
          }
          return updated
        })
      }
    } catch {
      setMessages((prev) => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          role: 'assistant',
          content:
            'Sorry, something went wrong. Try again or reach out at contact@gopalji.me.',
        }
        return updated
      })
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
          onClick={() => setOpen(false)}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="relative mx-4 flex w-full max-w-lg flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-900"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
              <span className="flex items-center gap-1.5 text-sm font-medium text-neutral-900 dark:text-neutral-100">
                <LuSparkles
                  size={13}
                  className="text-neutral-400 dark:text-neutral-500"
                />
                Chat with Gopalji
              </span>
              <div className="flex items-center gap-3">
                {messages.length > 0 && (
                  <button
                    onClick={() => setMessages([])}
                    disabled={loading}
                    aria-label="Clear chat"
                    className="cursor-pointer text-neutral-400 transition-colors hover:text-neutral-900 focus-visible:text-neutral-900 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-30 dark:hover:text-neutral-100 dark:focus-visible:text-neutral-100"
                  >
                    <LuRotateCcw size={14} />
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close chat"
                  className="cursor-pointer text-neutral-400 transition-colors hover:text-neutral-900 focus-visible:text-neutral-900 focus-visible:outline-none dark:hover:text-neutral-100 dark:focus-visible:text-neutral-100"
                >
                  <LuX size={14} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex h-72 flex-col gap-3 overflow-y-auto p-4">
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-lg bg-neutral-100 px-3 py-2 text-sm text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
                  {
                    "Hey, I'm Gopalji! Ask me about my work, projects, or whatever's on your mind :)"
                  }
                </div>
              </div>
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                      m.role === 'user'
                        ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
                        : 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200'
                    }`}
                  >
                    {m.content ? (
                      <MessageContent text={m.content} />
                    ) : (
                      <ThinkingDots />
                    )}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="flex items-center gap-2 border-t border-neutral-200 px-4 py-3 dark:border-neutral-800">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
                placeholder="Ask something..."
                disabled={loading}
                className="min-w-0 flex-1 bg-transparent text-base text-neutral-900 outline-none placeholder:text-neutral-400 disabled:opacity-50 sm:text-sm dark:text-neutral-100"
              />
              <button
                onClick={send}
                disabled={!input.trim() || loading}
                aria-label="Send message"
                className="cursor-pointer text-neutral-400 transition-colors hover:text-neutral-900 focus-visible:text-neutral-900 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-30 dark:hover:text-neutral-100 dark:focus-visible:text-neutral-100"
              >
                <LuSendHorizontal size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Chat with Gopalji AI"
        className="flex h-8 w-8 cursor-pointer items-center justify-center text-neutral-500 transition-colors hover:text-neutral-900 focus-visible:text-neutral-900 focus-visible:outline-none dark:text-neutral-400 dark:hover:text-neutral-100 dark:focus-visible:text-neutral-100"
      >
        <LuMessageSquare size={16} />
      </button>
    </>
  )
}
