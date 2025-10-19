'use client'

import { useState, useMemo } from 'react'
import DOMPurify from 'dompurify'

type Message = {
  role: 'user' | 'ai' | 'system'
  content: string
  timestamp: number
  code?: string
}

export function VibeSimulator() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [generatedHtml, setGeneratedHtml] = useState<string>('')
  const [showPreview, setShowPreview] = useState(false)
  const [buildProgress, setBuildProgress] = useState<string[]>([])
  const [isBuilding, setIsBuilding] = useState(false)
  const [hasInitialApp, setHasInitialApp] = useState(false)

  const buildSteps = [
    'Analyzing request',
    'Generating structure',
    'Applying styling',
    'Finalizing layout',
  ]

  const handleReset = () => {
    setMessages([])
    setInput('')
    setGeneratedHtml('')
    setShowPreview(false)
    setHasInitialApp(false)
    setIsBuilding(false)
    setBuildProgress([])
  }

  const handleSend = async () => {
    if (!input.trim() || isTyping) return

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, userMessage])
    const userInput = input
    setInput('')
    setIsTyping(true)

    // If we already have an app, treat this as a modification request
    if (hasInitialApp) {
      setTimeout(() => {
        const aiResponse: Message = {
          role: 'ai',
          content: 'Updating app...',
          timestamp: Date.now(),
        }

        setMessages((prev) => [...prev, aiResponse])
        setIsTyping(false)

        const steps = [
          'Analyzing changes',
          'Applying modifications',
          'Updating preview',
        ]
        setIsBuilding(true)
        setBuildProgress([])

        // Prepare context with previous HTML and modification request
        const modificationPrompt = `Current app HTML:\n${generatedHtml}\n\nUser requested change: ${userInput}\n\nPlease modify the HTML accordingly.`

        // Get current theme colors
        const theme = {
          bg:
            getComputedStyle(document.documentElement).getPropertyValue(
              '--color-dark-background',
            ) || '#030608',
          text:
            getComputedStyle(document.documentElement).getPropertyValue(
              '--color-dark-text',
            ) || '#e1ecf3',
        }

        const apiPromise = fetch('/api/generate-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: modificationPrompt, theme }),
        })

        const stepDuration = 800
        steps.forEach((step, index) => {
          setTimeout(() => {
            setBuildProgress((prev) => [...prev, step])
          }, index * stepDuration)
        })

        apiPromise
          .then((res) => res.json())
          .then((data) => {
            const minDelay = steps.length * stepDuration
            setTimeout(() => {
              setGeneratedHtml(data.html || generatedHtml)
              setShowPreview(true)
              setIsBuilding(false)

              // Update AI message to show "done"
              setMessages((prev) =>
                prev.map((msg, idx) =>
                  idx === prev.length - 1 && msg.role === 'ai'
                    ? { ...msg, content: 'Updating app... done.' }
                    : msg,
                ),
              )
            }, minDelay)
          })
          .catch(() => {
            setTimeout(() => {
              setShowPreview(true)
              setIsBuilding(false)

              // Update AI message to show "done"
              setMessages((prev) =>
                prev.map((msg, idx) =>
                  idx === prev.length - 1 && msg.role === 'ai'
                    ? { ...msg, content: 'Updating app... done.' }
                    : msg,
                ),
              )
            }, steps.length * stepDuration)
          })
      }, 1200)

      return
    }

    // Initial app creation
    setShowPreview(false)

    // Start building animation
    setTimeout(() => {
      const aiResponse: Message = {
        role: 'ai',
        content: 'Building your app...',
        timestamp: Date.now(),
      }

      setMessages((prev) => [...prev, aiResponse])
      setIsTyping(false)

      setIsBuilding(true)
      setBuildProgress([])

      // Get current theme colors
      const theme = {
        bg:
          getComputedStyle(document.documentElement).getPropertyValue(
            '--color-dark-background',
          ) || '#030608',
        text:
          getComputedStyle(document.documentElement).getPropertyValue(
            '--color-dark-text',
          ) || '#e1ecf3',
      }

      // Track start time for proper delay calculation
      const startTime = Date.now()

      // Start API call immediately
      const apiPromise = fetch('/api/generate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userInput, theme }),
      })

      // Animate through build steps while API is processing
      const stepDuration = 800 // ms per step
      buildSteps.forEach((step, index) => {
        setTimeout(() => {
          setBuildProgress((prev) => [...prev, step])
        }, index * stepDuration)
      })

      // Wait for API response
      apiPromise
        .then((res) => res.json())
        .then((data) => {
          // Ensure all steps have shown before displaying result
          const minDelay = buildSteps.length * stepDuration
          const elapsed = Date.now() - startTime
          const delay = Math.max(minDelay - elapsed, 0)

          setTimeout(() => {
            setGeneratedHtml(
              data.html ||
                '<div class="p-6 text-center text-neutral-400">Generated preview</div>',
            )
            setShowPreview(true)
            setIsBuilding(false)
            setHasInitialApp(true)

            // Update AI message to show "done"
            setMessages((prev) =>
              prev.map((msg, idx) =>
                idx === prev.length - 1 && msg.role === 'ai'
                  ? { ...msg, content: 'Building your app... done.' }
                  : msg,
              ),
            )
          }, delay)
        })
        .catch(() => {
          setTimeout(() => {
            setGeneratedHtml(
              '<div class="p-6 text-center text-neutral-400"><div class="text-4xl mb-4">⚠</div><div class="text-lg">Error generating preview</div></div>',
            )
            setShowPreview(true)
            setIsBuilding(false)

            // Update AI message to show "done"
            setMessages((prev) =>
              prev.map((msg, idx) =>
                idx === prev.length - 1 && msg.role === 'ai'
                  ? { ...msg, content: 'Building your app... done.' }
                  : msg,
              ),
            )
          }, buildSteps.length * stepDuration)
        })
    }, 1200)
  }

  const examples = [
    { text: 'Build a todo app' },
    { text: 'Create a timer' },
    { text: 'Make a weather widget' },
    { text: 'Build a calculator' },
  ]

  return (
    <div className="not-prose my-8">
      <div className="grid gap-4 md:grid-cols-2">
        {/* Chat Interface */}
        <div className="flex h-[500px] flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
          <div className="border-b border-neutral-200 bg-neutral-50 px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500" />
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                </div>
                <span className="ml-2 text-xs font-medium">AI Vibe Coder</span>
              </div>
              {hasInitialApp && (
                <button
                  onClick={handleReset}
                  className="rounded border border-neutral-300 px-2 py-1 text-xs transition-all hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
                  title="Start new app"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="flex min-h-full flex-col space-y-3">
              {messages.length === 0 && (
                <div className="flex flex-1 flex-col justify-center py-12 text-center text-sm text-neutral-500 dark:text-neutral-400">
                  <p className="mb-4">Describe what you want to build</p>
                  <div className="mx-auto grid max-w-sm grid-cols-2 gap-2">
                    {examples.map((ex, i) => (
                      <button
                        key={i}
                        onClick={() => setInput(ex.text)}
                        className="rounded-lg border border-neutral-200 px-3 py-2 text-xs transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900"
                      >
                        {ex.text}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 text-sm ${
                        msg.role === 'user'
                          ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-black'
                          : 'bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="rounded-lg bg-neutral-100 px-4 py-2 dark:bg-neutral-800">
                      <div className="flex gap-1">
                        <div
                          className="h-2 w-2 animate-bounce rounded-full bg-neutral-400"
                          style={{ animationDelay: '0ms' }}
                        />
                        <div
                          className="h-2 w-2 animate-bounce rounded-full bg-neutral-400"
                          style={{ animationDelay: '150ms' }}
                        />
                        <div
                          className="h-2 w-2 animate-bounce rounded-full bg-neutral-400"
                          style={{ animationDelay: '300ms' }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-neutral-200 p-3 dark:border-neutral-800">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={
                  hasInitialApp
                    ? 'Describe changes...'
                    : 'Type what you want to build...'
                }
                className="flex-1 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-neutral-900 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:focus:ring-neutral-100"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-all hover:opacity-90 disabled:opacity-50 dark:bg-neutral-100 dark:text-black"
              >
                Send
              </button>
            </div>
          </div>
        </div>

        {/* Preview Pane */}
        <div className="flex h-[500px] flex-col overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="border-b border-neutral-200 bg-white px-4 py-3 dark:border-neutral-800 dark:bg-neutral-950">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium">Live Preview</span>
              {messages.length > 0 && (
                <span className="text-xs text-green-600 dark:text-green-400">
                  ● {messages.filter((m) => m.role === 'ai').length} builds
                </span>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {isBuilding ? (
              <div className="h-full pt-20">
                <div className="mx-auto w-full max-w-sm">
                  <div className="mb-8 text-center text-sm font-medium text-neutral-400">
                    Building your app...
                  </div>
                  <div className="space-y-4">
                    {buildProgress.map((step, i) => (
                      <div
                        key={i}
                        className="animate-in fade-in flex items-center gap-3 text-sm text-neutral-300 duration-200"
                      >
                        <div className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500" />
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : showPreview && generatedHtml ? (
              <SafeHtmlPreview html={generatedHtml} />
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-center text-neutral-400 dark:text-neutral-600">
                <div className="mb-3 h-12 w-12 rounded-lg border-2 border-dashed border-neutral-700" />
                <p className="text-sm">Your app will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {messages.length > 0 && (
        <div className="mt-4 rounded-lg border border-neutral-700 bg-neutral-800 p-3 text-xs text-neutral-400">
          <strong className="text-neutral-300">Note:</strong> This is a visual
          mockup preview, not a fully functional application.
        </div>
      )}
    </div>
  )
}

// Safe HTML Preview Component with sanitization
function SafeHtmlPreview({ html }: { html: string }) {
  const sanitizedHtml = useMemo(() => {
    if (typeof window === 'undefined') return ''

    // Configure DOMPurify to be strict but allow Tailwind classes
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: [
        'div',
        'span',
        'p',
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'ul',
        'ol',
        'li',
        'a',
        'button',
        'input',
        'label',
        'form',
        'img',
        'svg',
        'path',
        'circle',
        'rect',
        'line',
        'table',
        'thead',
        'tbody',
        'tr',
        'th',
        'td',
        'strong',
        'em',
        'br',
        'hr',
        'nav',
        'header',
        'footer',
        'section',
        'article',
        'aside',
        'main',
      ],
      ALLOWED_ATTR: [
        'class',
        'id',
        'style',
        'href',
        'src',
        'alt',
        'title',
        'type',
        'placeholder',
        'value',
        'name',
        'disabled',
        'viewBox',
        'fill',
        'stroke',
        'stroke-width',
        'd',
        'width',
        'height',
        'x',
        'y',
        'cx',
        'cy',
        'r',
      ],
      ALLOW_DATA_ATTR: false,
      FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'link', 'style'],
      FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
    })
  }, [html])

  return (
    <div className="animate-in fade-in h-full w-full overflow-hidden duration-500">
      <div
        className="h-full w-full overflow-auto rounded-lg bg-neutral-900"
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      />
    </div>
  )
}
