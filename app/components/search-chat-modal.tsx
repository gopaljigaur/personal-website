'use client'

import { memo, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  LuSendHorizontal,
  LuRotateCcw,
  LuSparkles,
  LuSearch,
  LuCheck,
  LuX,
} from 'react-icons/lu'
import { TitleBar } from 'app/components/title-bar'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { profile } from 'app/lib/profile'
import type { SearchResult } from 'app/lib/search'

type Tab = 'search' | 'chat'
type ContactFormData = { name: string; email: string; message: string }
type Message = {
  role: 'user' | 'assistant'
  content: string
  contactForm?: ContactFormData
}
type Group = 'Pages' | 'Blog' | 'Projects' | 'Contact'
type Item = {
  group: Group
  title: string
  subtitle?: string
  href: string
  external?: boolean
  score?: number
}

const PAGES: Item[] = [
  { group: 'Pages', title: 'Home', href: '/' },
  { group: 'Pages', title: 'Blog', href: '/blog' },
  { group: 'Pages', title: 'Projects', href: '/projects' },
  { group: 'Pages', title: 'Misc', href: '/misc' },
]

const GROUP_STYLE: Record<Group, string> = {
  Pages:
    'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400',
  Blog: 'bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400',
  Projects:
    'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400',
  Contact: 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400',
}

const SUGGESTIONS = [
  'What are you working on?',
  "What's your background in ML?",
  'How can I contact you?',
  'Tell me about your projects',
]

const SKELETON_WIDTHS = [
  ['w-2/5', 'w-3/5'],
  ['w-3/5', 'w-4/5'],
  ['w-1/2', 'w-2/3'],
  ['w-1/3', 'w-1/2'],
]

function rankScore(item: Item, lq: string): number {
  const s = item.score ?? 0
  if (item.title.toLowerCase().includes(lq)) return 2.0 + s * 0.5
  if (item.subtitle?.toLowerCase().includes(lq)) return 1.0 + s * 0.5
  return s
}

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return <>{text}</>
  return (
    <>
      {text.slice(0, idx)}
      <span className="rounded bg-yellow-200 font-semibold text-yellow-900 dark:bg-yellow-800/50 dark:text-yellow-200">
        {text.slice(idx, idx + query.length)}
      </span>
      {text.slice(idx + query.length)}
    </>
  )
}

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

const CONTACT_FORM_MARKER = '__CONTACT_FORM__'
const CONTACT_SENT_MARKER = '__CONTACT_SENT__'

function parseContactForm(content: string): {
  text: string
  form: ContactFormData | null
  sent: boolean
} {
  if (content.includes(CONTACT_SENT_MARKER)) {
    const text = content.slice(0, content.indexOf(CONTACT_SENT_MARKER)).trim()
    return { text, form: null, sent: true }
  }
  const idx = content.indexOf(CONTACT_FORM_MARKER)
  if (idx === -1) return { text: content, form: null, sent: false }
  const text = content.slice(0, idx).trim()
  try {
    const form = JSON.parse(
      content.slice(idx + CONTACT_FORM_MARKER.length).trim(),
    )
    return { text, form, sent: false }
  } catch {
    return { text, form: null, sent: false }
  }
}

const inputClass =
  'w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:focus:border-neutral-500'

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
          {label}
        </span>
        {required ? (
          <span className="text-xs text-neutral-400">required</span>
        ) : (
          <span className="text-xs text-neutral-400">optional</span>
        )}
      </div>
      {children}
    </div>
  )
}

function InlineContactForm({
  initial,
  onResult,
}: {
  initial: ContactFormData
  onResult: (ok: boolean) => void
}) {
  const [name, setName] = useState(initial.name)
  const [email, setEmail] = useState(initial.email)
  const [message, setMessage] = useState(initial.message)
  const [result, setResult] = useState<'sent' | 'error' | null>(null)

  async function submit() {
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, question: message }),
      })
      const ok = res.ok
      setResult(ok ? 'sent' : 'error')
      onResult(ok)
    } catch {
      setResult('error')
      onResult(false)
    }
  }

  if (result !== null) {
    return (
      <p
        className={`mt-1 text-xs ${result === 'sent' ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}
      >
        {result === 'sent'
          ? 'Message sent.'
          : 'Failed to send — try emailing directly.'}
      </p>
    )
  }

  return (
    <div className="mt-2 flex flex-col gap-3 rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 dark:border-neutral-700 dark:bg-neutral-800/40">
      <Field label="Name" required>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className={inputClass}
        />
      </Field>
      <Field label="Email" required>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="you@example.com"
          className={inputClass}
        />
      </Field>
      <Field label="Message">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          placeholder="What would you like to say?"
          className={`${inputClass} resize-none`}
        />
      </Field>
      <button
        onClick={submit}
        disabled={!name || !email}
        className="cursor-pointer self-end rounded-md bg-neutral-900 px-4 py-2 text-xs font-medium text-white transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-neutral-100 dark:text-neutral-900"
      >
        Send
      </button>
    </div>
  )
}

function resultToItem(r: SearchResult): Item {
  const groupMap: Partial<Record<SearchResult['type'], Group>> = {
    blog: 'Blog',
    project: 'Projects',
    profile: 'Pages',
    contact: 'Contact',
  }
  return {
    group: groupMap[r.type] ?? 'Pages',
    title: r.title,
    subtitle: r.text,
    href: r.url,
    external: r.url.startsWith('http') || r.url.startsWith('mailto:'),
    score: r.score,
  }
}

export function SearchChatModal({
  posts,
  projects,
}: {
  posts: { title: string; slug: string; summary: string }[]
  projects: { title: string; summary: string; href: string }[]
}) {
  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [tab, setTab] = useState<Tab>('search')
  const [isDesktop, setIsDesktop] = useState(false)
  const [debugInfo, setDebugInfo] = useState('')
  const vpContainerRef = useRef<HTMLDivElement>(null)

  // Search state
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const [searchItems, setSearchItems] = useState<Item[] | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const router = useRouter()

  // Chat state
  const [messages, setMessages] = useState<Message[]>([])
  const [chatInput, setChatInput] = useState('')
  const [loading, setLoading] = useState(false)
  const chatInputRef = useRef<HTMLInputElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const ref = tab === 'search' ? searchInputRef : chatInputRef
    setTimeout(() => ref.current?.focus(), 50)
  }, [open, tab])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const onSearch = () => {
      setTab('search')
      setOpen(true)
    }
    const onChat = () => {
      setTab('chat')
      setOpen(true)
    }
    const onKeydown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((o) => !o)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('openCommandPalette', onSearch)
    window.addEventListener('openChat', onChat)
    window.addEventListener('keydown', onKeydown)
    return () => {
      window.removeEventListener('openCommandPalette', onSearch)
      window.removeEventListener('openChat', onChat)
      window.removeEventListener('keydown', onKeydown)
    }
  }, [])

  useEffect(() => {
    if (open) {
      setQuery('')
      setSelected(0)
      setSearchItems(null)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const y = window.scrollY
    window.scrollTo(0, 0)
    const el = vpContainerRef.current
    if (el) {
      el.style.top = '0px'
      el.style.height = '100dvh'
    }
    // Prevent background scroll without position:fixed (which keeps iOS chrome expanded)
    document.documentElement.style.overscrollBehavior = 'none'
    document.body.style.overflow = 'hidden'
    return () => {
      document.documentElement.style.overscrollBehavior = ''
      document.body.style.overflow = ''
      window.scrollTo(0, y)
    }
  }, [open])

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 640px)')
    setIsDesktop(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // Track both vp.offsetTop and vp.height directly on the DOM.
  // dvh does not resize on iOS Safari when the keyboard opens — only
  // visualViewport.height reliably reflects the keyboard-adjusted size.
  useEffect(() => {
    const vp = window.visualViewport
    if (!vp) return
    const update = () => {
      const el = vpContainerRef.current
      if (!el) return
      el.style.top = `${vp.offsetTop}px`
      el.style.height = `${vp.height}px`
      setDebugInfo(
        `top:${vp.offsetTop.toFixed(0)} h:${vp.height.toFixed(0)} iH:${window.innerHeight}`,
      )
    }
    update()
    vp.addEventListener('resize', update)
    vp.addEventListener('scroll', update)
    return () => {
      vp.removeEventListener('resize', update)
      vp.removeEventListener('scroll', update)
    }
  }, [])

  useEffect(() => {
    setSelected(0)
  }, [query])

  useEffect(() => {
    if (!query) {
      setSearchItems(null)
      return
    }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        setSearchItems(((await res.json()) as SearchResult[]).map(resultToItem))
      } catch {
        setSearchItems([])
      }
    }, 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query])

  const staticItems: Item[] = [
    ...posts.map((p) => ({
      group: 'Blog' as const,
      title: p.title,
      subtitle: p.summary,
      href: `/blog/${p.slug}`,
    })),
    ...projects.map((p) => ({
      group: 'Projects' as const,
      title: p.title,
      subtitle: p.summary,
      href: p.href,
      external: true,
    })),
  ]

  const lq = query.toLowerCase()
  const filtered: Item[] = (() => {
    if (!query) return []
    const map = new Map<string, Item>()
    ;[
      ...PAGES.filter((p) => p.title.toLowerCase().includes(lq)),
      ...staticItems.filter(
        (i) =>
          i.title.toLowerCase().includes(lq) ||
          i.subtitle?.toLowerCase().includes(lq),
      ),
    ].forEach((item) => map.set(item.href, item))
    ;(searchItems ?? []).forEach((item) => {
      map.set(item.href, { ...(map.get(item.href) ?? item), score: item.score })
    })
    return [...map.values()].sort((a, b) => rankScore(b, lq) - rankScore(a, lq))
  })()

  const navigate = (item: Item) => {
    if (item.external) window.open(item.href, '_blank')
    else router.push(item.href)
    setOpen(false)
  }

  const onSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelected((s) => Math.min(s + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelected((s) => Math.max(s - 1, 0))
    } else if (e.key === 'Enter' && filtered[selected])
      navigate(filtered[selected])
  }

  async function send(textOverride?: string) {
    const text = (textOverride ?? chatInput).trim()
    if (!text || loading) return
    setChatInput('')
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
      if (!res.ok || !res.body) throw new Error()
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        setMessages((prev) => {
          const updated = [...prev]
          const last = updated[updated.length - 1]
          const raw = last.content + chunk
          const { form } = parseContactForm(raw)
          updated[updated.length - 1] = {
            role: 'assistant',
            content: raw,
            ...(form ? { contactForm: form } : {}),
          }
          return updated
        })
      }
    } catch {
      setMessages((prev) => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          role: 'assistant',
          content: `Sorry, something went wrong. Try again or reach out at ${profile.contact.email}.`,
        }
        return updated
      })
    } finally {
      setLoading(false)
      setTimeout(() => chatInputRef.current?.focus(), 0)
    }
  }

  const switchToChat = (withQuery: string) => {
    setTab('chat')
    setChatInput(withQuery)
  }

  const showSkeleton = !!query && searchItems === null && filtered.length === 0
  const showNudge = !!query && !showSkeleton && filtered.length === 0

  if (!open) return null

  const close = () => {
    setOpen(false)
    setExpanded(false)
  }

  return (
    <>
      <div
        className="fixed inset-0 z-50 [touch-action:none] bg-black/40 backdrop-blur-sm"
        onClick={close}
      />
      <div
        ref={vpContainerRef}
        className="fixed inset-x-0 top-0 z-50 flex h-dvh flex-col items-center p-2 sm:py-[8vh]"
        onClick={close}
      >
        <div
          className={`flex w-full flex-1 flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-2xl transition-[max-width,max-height] duration-200 dark:border-neutral-800 dark:bg-neutral-900 ${expanded ? 'max-w-3xl sm:max-h-[56rem]' : 'max-w-lg sm:max-h-[36rem]'}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* DEBUG — remove before ship */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              background: 'red',
              color: 'white',
              fontSize: 10,
              padding: '2px 4px',
              zIndex: 9999,
              pointerEvents: 'none',
            }}
          >
            {debugInfo}
          </div>
          {/* Header */}
          <div className="shrink-0 border-b border-neutral-200 dark:border-neutral-800">
            <TitleBar
              onClose={close}
              expanded={expanded}
              onExpand={isDesktop ? () => setExpanded((e) => !e) : undefined}
            />
            <div className="px-3 pt-2 pb-3">
              <div className="flex h-9 w-full items-center justify-center rounded-lg bg-neutral-100 p-[3px] text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                {(['search', 'chat'] as Tab[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`relative inline-flex h-full flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-md border border-transparent px-2 text-sm font-medium whitespace-nowrap transition-all ${
                      tab === t
                        ? 'bg-white text-neutral-900 shadow-sm dark:border-transparent dark:bg-neutral-700/60 dark:text-neutral-100'
                        : 'text-neutral-900/60 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100'
                    }`}
                  >
                    {t === 'search' ? (
                      <LuSearch size={14} />
                    ) : (
                      <LuSparkles size={14} />
                    )}
                    {t === 'search' ? 'Search' : 'Ask AI'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Content area */}
          <div className="min-h-0 flex-1 overflow-y-auto">
            {tab === 'search' && (
              <ul
                className={`py-2 ${showNudge ? 'flex h-full items-center justify-center' : ''}`}
              >
                {showSkeleton &&
                  SKELETON_WIDTHS.map(([tw, sw], i) => (
                    <li key={i} className="flex flex-col gap-1.5 px-4 py-2.5">
                      <div
                        className={`h-3.5 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800 ${tw}`}
                      />
                      <div
                        className={`h-3 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800 ${sw}`}
                      />
                    </li>
                  ))}
                {showNudge && (
                  <li className="flex flex-col items-center gap-3">
                    <span className="text-sm text-neutral-400">No results</span>
                    <button
                      onClick={() => switchToChat(query)}
                      className="flex cursor-pointer items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
                    >
                      <LuSparkles size={11} />
                      Ask AI instead
                    </button>
                  </li>
                )}
                {!showSkeleton &&
                  !showNudge &&
                  filtered.map((item, i) => (
                    <li key={item.href}>
                      <button
                        className={`flex w-full cursor-pointer flex-col px-4 py-3 text-left text-sm transition-colors ${
                          i === selected
                            ? 'bg-neutral-100 dark:bg-neutral-800'
                            : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                        }`}
                        onClick={() => navigate(item)}
                        onMouseEnter={() => setSelected(i)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-medium text-neutral-900 dark:text-neutral-100">
                            <Highlight text={item.title} query={query} />
                          </span>
                          <span
                            className={`mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-xs font-medium ${GROUP_STYLE[item.group]}`}
                          >
                            {item.group}
                          </span>
                        </div>
                        {item.subtitle && (
                          <span className="mt-0.5 line-clamp-1 text-xs text-neutral-500 dark:text-neutral-400">
                            <Highlight text={item.subtitle} query={query} />
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
              </ul>
            )}

            {tab === 'chat' && (
              <div className="flex flex-col gap-3 p-4">
                <div className="flex justify-start">
                  <div className="max-w-[85%] rounded-lg bg-neutral-100 px-3 py-2 text-sm text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
                    {
                      "Hey, I'm Gopalji! Ask me about my work, projects, or whatever's on your mind :)"
                    }
                  </div>
                </div>
                {messages.length === 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => setChatInput(s)}
                        className="cursor-pointer rounded-full border border-neutral-200 px-3 py-1.5 text-xs text-neutral-500 transition-colors hover:border-neutral-400 hover:text-neutral-700 dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-neutral-500 dark:hover:text-neutral-200"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
                {messages.map((m, i) => {
                  if (
                    m.role === 'user' &&
                    m.content.startsWith('[contact_result:')
                  )
                    return null
                  const { text, form, sent } =
                    m.role === 'assistant'
                      ? parseContactForm(m.content)
                      : { text: m.content, form: null, sent: false }
                  return (
                    <div
                      key={i}
                      className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      {(text || (!form && !sent)) && (
                        <div
                          className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                            m.role === 'user'
                              ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
                              : 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200'
                          }`}
                        >
                          {text ? (
                            <MessageContent text={text} />
                          ) : (
                            <ThinkingDots />
                          )}
                        </div>
                      )}
                      {sent && (
                        <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                          Message sent.
                        </p>
                      )}
                      {form && (
                        <div className="w-full max-w-[85%]">
                          <InlineContactForm
                            initial={form}
                            onResult={(ok) => {
                              setMessages((prev) =>
                                prev.map((msg, j) =>
                                  j === i
                                    ? {
                                        ...msg,
                                        content: msg.content.replace(
                                          CONTACT_FORM_MARKER,
                                          CONTACT_SENT_MARKER,
                                        ),
                                      }
                                    : msg,
                                ),
                              )
                              send(
                                ok
                                  ? '[contact_result:sent]'
                                  : '[contact_result:error]',
                              )
                            }}
                          />
                        </div>
                      )}
                    </div>
                  )
                })}
                {messages.length > 0 && (
                  <div className="flex justify-end pt-4">
                    <button
                      onClick={() => setMessages([])}
                      disabled={loading}
                      className="flex cursor-pointer items-center gap-1.5 text-xs text-neutral-400 transition-colors hover:text-neutral-600 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:text-neutral-300"
                    >
                      <LuRotateCcw size={11} />
                      New conversation
                    </button>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>
            )}
          </div>

          {/* Input area — fixed height, same on both tabs */}
          <div className="flex h-[52px] shrink-0 items-center gap-2 border-t border-neutral-200 px-4 dark:border-neutral-800">
            {tab === 'search' && (
              <>
                <input
                  ref={searchInputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={onSearchKeyDown}
                  placeholder="Search pages, posts, projects…"
                  className="min-w-0 flex-1 bg-transparent text-base text-neutral-900 outline-none placeholder:text-neutral-400 sm:text-sm dark:text-neutral-100"
                />
                <button
                  onClick={() => {
                    setQuery('')
                    searchInputRef.current?.focus()
                  }}
                  aria-label="Clear search"
                  className={`flex cursor-pointer items-center justify-center p-1.5 text-neutral-400 transition-colors hover:text-neutral-700 focus-visible:outline-none dark:hover:text-neutral-200 ${query ? 'visible' : 'invisible'}`}
                >
                  <LuX size={12} />
                </button>
              </>
            )}
            {tab === 'chat' && (
              <>
                <input
                  ref={chatInputRef}
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
                  placeholder="Ask something..."
                  disabled={loading}
                  className="min-w-0 flex-1 bg-transparent text-base text-neutral-900 outline-none placeholder:text-neutral-400 disabled:opacity-50 sm:text-sm dark:text-neutral-100"
                />
                <button
                  onClick={() => send()}
                  disabled={!chatInput.trim() || loading}
                  aria-label="Send message"
                  className="cursor-pointer text-neutral-400 transition-colors hover:text-neutral-900 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-30 dark:hover:text-neutral-100"
                >
                  <LuSendHorizontal size={14} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
