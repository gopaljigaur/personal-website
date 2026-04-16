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

  async function send() {
    const text = input.trim()
    if (!text || loading) return
    setInput('')

    const userMsg: Message = { role: 'user', content: text }
    const nextMessages = [...messages, userMsg]
    setMessages(nextMessages)
    setLoading(true)

    // Placeholder for streaming assistant message
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
    <div className="relative">
      {/* Chat panel */}
      {open && (
        <div className="absolute right-0 bottom-full z-50 mb-2 flex w-80 flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-2xl sm:w-96 dark:border-neutral-800 dark:bg-neutral-900">
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
                  className="cursor-pointer text-neutral-400 transition-colors hover:text-neutral-900 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:text-neutral-100"
                >
                  <LuRotateCcw size={14} />
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                className="cursor-pointer text-neutral-400"
              >
                <LuX size={14} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex max-h-80 flex-col gap-3 overflow-y-auto p-4">
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-lg bg-neutral-100 px-3 py-2 text-sm text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
                {
                  "Hey, I'm Gopalji! Ask me anything about my work, projects, or anything else :)"
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
          <div className="flex items-center gap-2 border-t border-neutral-200 px-3 py-2 dark:border-neutral-800">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
              placeholder="Ask something..."
              disabled={loading}
              className="min-w-0 flex-1 bg-transparent py-1 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 disabled:opacity-50 dark:text-neutral-100"
            />
            <button
              onClick={send}
              disabled={!input.trim() || loading}
              aria-label="Send message"
              className="cursor-pointer text-neutral-400 transition-colors hover:text-neutral-900 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:text-neutral-100"
            >
              <LuSendHorizontal size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Chat with Gopalji AI"
        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-600 shadow-lg transition-colors hover:bg-neutral-50 hover:text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
      >
        <LuMessageSquare size={16} />
      </button>
    </div>
  )
}
