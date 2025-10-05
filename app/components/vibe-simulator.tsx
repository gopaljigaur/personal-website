'use client'

import { useState, useEffect, useMemo } from 'react'
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

  const projects = [
    {
      trigger: ['todo', 'task', 'list'],
      name: 'Todo App',
      steps: ['Analyzing requirements', 'Generating component structure', 'Applying styling', 'Finalizing layout']
    },
    {
      trigger: ['timer', 'countdown', 'clock'],
      name: 'Timer',
      steps: ['Creating timer logic', 'Building UI controls', 'Adding functionality', 'Finalizing layout']
    },
    {
      trigger: ['weather', 'forecast'],
      name: 'Weather Widget',
      steps: ['Setting up structure', 'Designing layout', 'Adding components', 'Finalizing layout']
    },
    {
      trigger: ['calculator', 'calc', 'math'],
      name: 'Calculator',
      steps: ['Building keypad', 'Implementing operations', 'Styling display', 'Finalizing layout']
    },
  ]

  const handleSend = async () => {
    if (!input.trim() || isTyping) return

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: Date.now(),
    }

    setMessages(prev => [...prev, userMessage])
    const userInput = input
    setInput('')
    setIsTyping(true)
    setShowPreview(false)

    // Check if input matches a project
    const matchedProject = projects.find(p =>
      p.trigger.some(trigger => userInput.toLowerCase().includes(trigger))
    )

    // Start building animation
    setTimeout(() => {
      const aiResponse: Message = {
        role: 'ai',
        content: matchedProject
          ? `Building your ${matchedProject.name}...`
          : `Creating "${userInput}"...`,
        timestamp: Date.now(),
      }

      setMessages(prev => [...prev, aiResponse])
      setIsTyping(false)

      const steps = matchedProject?.steps || ['Analyzing request', 'Generating structure', 'Applying styling', 'Finalizing layout']
      setIsBuilding(true)
      setBuildProgress([])

      // Start API call immediately
      const apiPromise = fetch('/api/generate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userInput }),
      })

      // Animate through build steps while API is processing
      const stepDuration = 800 // ms per step
      steps.forEach((step, index) => {
        setTimeout(() => {
          setBuildProgress(prev => [...prev, step])
        }, index * stepDuration)
      })

      // Wait for API response
      apiPromise
        .then(res => res.json())
        .then(data => {
          // Ensure all steps have shown before displaying result
          const minDelay = steps.length * stepDuration
          const elapsed = Date.now() - Date.now()
          const delay = Math.max(minDelay - elapsed, 0)

          setTimeout(() => {
            setGeneratedHtml(data.html || '<div class="p-6 text-center text-neutral-400">Generated preview</div>')
            setShowPreview(true)
            setIsBuilding(false)
          }, delay)
        })
        .catch(err => {
          setTimeout(() => {
            setGeneratedHtml('<div class="p-6 text-center text-neutral-400"><div class="text-4xl mb-4">⚠</div><div class="text-lg">Error generating preview</div></div>')
            setShowPreview(true)
            setIsBuilding(false)
          }, steps.length * stepDuration)
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
    <div className="my-8 not-prose">
      <div className="grid md:grid-cols-2 gap-4">
        {/* Chat Interface */}
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 overflow-hidden flex flex-col h-[500px]">
          <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <span className="text-xs font-medium ml-2">AI Vibe Coder</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-3 min-h-full flex flex-col">
              {messages.length === 0 && (
                <div className="text-center py-12 text-neutral-500 dark:text-neutral-400 text-sm flex-1 flex flex-col justify-center">
                  <p className="mb-4">Describe what you want to build</p>
                  <div className="grid grid-cols-2 gap-2 max-w-sm mx-auto">
                    {examples.map((ex, i) => (
                      <button
                        key={i}
                        onClick={() => setInput(ex.text)}
                        className="text-xs px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
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
                          ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-black'
                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-neutral-100 dark:bg-neutral-800 rounded-lg px-4 py-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="p-3 border-t border-neutral-200 dark:border-neutral-800">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type what you want to build..."
                className="flex-1 px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-neutral-900 dark:bg-neutral-100 text-white dark:text-black hover:opacity-90 disabled:opacity-50 transition-all"
              >
                Send
              </button>
            </div>
          </div>
        </div>

        {/* Preview Pane */}
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 overflow-hidden flex flex-col h-[500px]">
          <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium">Live Preview</span>
              {messages.length > 0 && (
                <span className="text-xs text-green-600 dark:text-green-400">
                  ● {messages.filter(m => m.role === 'ai').length} builds
                </span>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {isBuilding ? (
              <div className="h-full pt-20">
                <div className="w-full max-w-sm mx-auto">
                  <div className="text-sm font-medium mb-8 text-center text-neutral-400">Building your app...</div>
                  <div className="space-y-4">
                    {buildProgress.map((step, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 text-sm text-neutral-300 animate-in fade-in duration-200"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : showPreview && generatedHtml ? (
              <SafeHtmlPreview html={generatedHtml} />
            ) : (
              <div className="text-center text-neutral-400 dark:text-neutral-600 flex flex-col items-center justify-center h-full">
                <div className="w-12 h-12 mb-3 rounded-lg border-2 border-dashed border-neutral-700" />
                <p className="text-sm">Your app will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {messages.length > 0 && (
        <div className="mt-4 p-3 rounded-lg bg-neutral-800 border border-neutral-700 text-xs text-neutral-400">
          <strong className="text-neutral-300">Note:</strong> This is a visual mockup preview, not a fully functional application.
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
        'div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li', 'a', 'button', 'input', 'label', 'form',
        'img', 'svg', 'path', 'circle', 'rect', 'line',
        'table', 'thead', 'tbody', 'tr', 'th', 'td',
        'strong', 'em', 'br', 'hr', 'nav', 'header', 'footer',
        'section', 'article', 'aside', 'main'
      ],
      ALLOWED_ATTR: [
        'class', 'id', 'style', 'href', 'src', 'alt', 'title',
        'type', 'placeholder', 'value', 'name', 'disabled',
        'viewBox', 'fill', 'stroke', 'stroke-width', 'd',
        'width', 'height', 'x', 'y', 'cx', 'cy', 'r'
      ],
      ALLOW_DATA_ATTR: false,
      FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'link', 'style'],
      FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
    })
  }, [html])

  return (
    <div className="animate-in fade-in duration-500 w-full h-full overflow-hidden">
      <div
        className="w-full h-full overflow-auto bg-neutral-900 rounded-lg"
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      />
    </div>
  )
}
