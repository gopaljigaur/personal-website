import { NextRequest } from 'next/server'
import { searchSite, EMBEDDINGS_PATH } from 'app/lib/search'
import { kv } from '@vercel/kv'
import { createHash } from 'crypto'
import fs from 'fs'

const MAX_INPUT_LENGTH = 500
const MAX_MESSAGES = 10 // keep last 10 messages (5 turns)
const RATE_LIMIT = 20 // requests per IP per hour
const CACHE_TTL = 86400 // 24 hours in seconds

const GEMINI_URL = (streaming: boolean) =>
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:${
    streaming ? 'streamGenerateContent?alt=sse&' : 'generateContent?'
  }key=${process.env.GEMINI_API_KEY}`

const TOOLS = [
  {
    functionDeclarations: [
      {
        name: 'search_site',
        description:
          'Search the website for information about Gopalji — his background, projects, blog posts, and contact details (email, GitHub, LinkedIn, resume). Call this whenever the user asks about him, his work, or how to reach him.',
        parameters: {
          type: 'OBJECT',
          properties: {
            query: { type: 'STRING', description: 'The search query' },
          },
          required: ['query'],
        },
      },
    ],
  },
]

const SYSTEM_PROMPT = `You are Gopalji Gaur. Answer questions as him, in first person, concisely and conversationally. Do not use markdown formatting — no bold, no bullet points, no headers. Write in plain conversational sentences.

Never mention tools, functions, or any internal mechanisms to the user. Just answer naturally.

Search the site whenever the user asks about blog posts, projects, writing, or anything that might be covered on the site. Prefer searching before answering from memory.

If the user wants to reach Gopalji directly, ask for their name and email. As soon as you have both, immediately end your response with this marker — do not ask for anything else:
__CONTACT_FORM__{"name":"<their name>","email":"<their email>","message":"<summarize from conversation context, or leave empty>"}

If the user's message is [contact_result:sent], the contact form was submitted successfully — respond naturally, e.g. acknowledge you'll get back to them.
If the user's message is [contact_result:error], the form submission failed — respond empathetically and suggest they try emailing directly at contact@gopalji.me.

If something is genuinely not covered even after searching, say you're not sure and suggest the user reach out at contact@gopalji.me.`

type GeminiPart =
  | { text: string }
  | { functionCall: { name: string; args: Record<string, string> } }
  | { functionResponse: { name: string; response: unknown } }

type GeminiMessage = { role: 'user' | 'model'; parts: GeminiPart[] }

// Embeddings hash computed once per cold start — cache-busts on redeploy
let _embeddingsHash = ''
function getEmbeddingsHash(): string {
  if (_embeddingsHash) return _embeddingsHash
  try {
    const content = fs.readFileSync(EMBEDDINGS_PATH)
    _embeddingsHash = createHash('sha256')
      .update(content)
      .digest('hex')
      .slice(0, 8)
  } catch {
    _embeddingsHash = 'no-embed'
  }
  return _embeddingsHash
}

function makeCacheKey(messages: GeminiMessage[]): string {
  const msgHash = createHash('sha256')
    .update(JSON.stringify(messages))
    .digest('hex')
    .slice(0, 16)
  return `chat:${getEmbeddingsHash()}:${msgHash}`
}

// KV helpers — fail silently when KV is not configured
async function checkRateLimit(ip: string): Promise<boolean> {
  try {
    const key = `rl:${ip}`
    const count = await kv.incr(key)
    if (count === 1) await kv.expire(key, 3600)
    return count <= RATE_LIMIT
  } catch {
    return true
  }
}

async function getCached(key: string): Promise<string | null> {
  try {
    return await kv.get<string>(key)
  } catch {
    return null
  }
}

async function setCached(key: string, value: string): Promise<void> {
  try {
    await kv.set(key, value, { ex: CACHE_TTL })
  } catch {
    // KV unavailable — skip caching
  }
}

export async function POST(request: NextRequest) {
  try {
    return await handleChat(request)
  } catch (err) {
    console.error('[chat] unhandled error:', err)
    return new Response('Internal server error', { status: 500 })
  }
}

async function handleChat(request: NextRequest) {
  if (!process.env.GEMINI_API_KEY)
    return new Response('Service unavailable', { status: 503 })

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'anonymous'
  if (!(await checkRateLimit(ip)))
    return new Response('Too many requests', { status: 429 })

  let body: { messages: { role: string; parts: { text: string }[] }[] }
  try {
    body = await request.json()
  } catch {
    return new Response('Invalid JSON', { status: 400 })
  }

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return new Response('Invalid request', { status: 400 })
  }

  const messages: GeminiMessage[] = body.messages
    .filter((m) => m.role === 'user' || m.role === 'model')
    .slice(-MAX_MESSAGES)
    .map((m) => ({
      role: m.role as 'user' | 'model',
      parts: [
        { text: String(m.parts?.[0]?.text ?? '').slice(0, MAX_INPUT_LENGTH) },
      ],
    }))

  const cacheKey = makeCacheKey(messages)
  const cached = await getCached(cacheKey)
  if (cached) {
    return new Response(cached, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  }

  // Phase 1: non-streaming — detect tool call
  const phase1Res = await fetch(GEMINI_URL(false), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: messages,
      tools: TOOLS,
    }),
  })

  if (!phase1Res.ok) return new Response('Upstream error', { status: 502 })

  const phase1 = (await phase1Res.json()) as {
    candidates: { content: { parts: GeminiPart[]; role: string } }[]
  }
  const candidateParts = phase1.candidates?.[0]?.content?.parts ?? []
  const functionCall = candidateParts.find(
    (
      p,
    ): p is { functionCall: { name: string; args: Record<string, string> } } =>
      'functionCall' in p,
  )?.functionCall

  if (!functionCall) {
    const text = candidateParts
      .filter((p): p is { text: string } => 'text' in p)
      .map((p) => p.text)
      .join('')
    await setCached(cacheKey, text)
    return new Response(text, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  }

  const searchResults = await searchSite(functionCall.args.query)
  const contentsWithTool: GeminiMessage[] = [
    ...messages,
    { role: 'model', parts: [{ functionCall }] },
    {
      role: 'user',
      parts: [
        {
          functionResponse: {
            name: 'search_site',
            response: {
              results: searchResults.map((r) => ({
                type: r.type,
                title: r.title,
                url: r.url,
                summary: r.text,
              })),
            },
          },
        },
      ],
    },
  ]

  // Phase 2: stream to client, accumulate for cache
  const phase2Res = await fetch(GEMINI_URL(true), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: contentsWithTool,
    }),
  })

  if (!phase2Res.ok) return new Response('Upstream error', { status: 502 })

  const encoder = new TextEncoder()
  let assembled = ''

  const stream = new ReadableStream({
    async start(controller) {
      const reader = phase2Res.body?.getReader()
      if (!reader) {
        controller.close()
        return
      }
      const decoder = new TextDecoder()
      let buffer = ''
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() ?? ''
          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            const json = line.slice(6).trim()
            if (!json || json === '[DONE]') continue
            try {
              const chunk = JSON.parse(json) as {
                candidates: { content: { parts: { text?: string }[] } }[]
              }
              const text = chunk.candidates?.[0]?.content?.parts
                ?.filter((p) => p.text)
                ?.map((p) => p.text)
                ?.join('')
              if (text) {
                assembled += text
                controller.enqueue(encoder.encode(text))
              }
            } catch {
              // malformed chunk, skip
            }
          }
        }
      } finally {
        controller.close()
        setCached(cacheKey, assembled)
      }
    },
  })

  return new Response(stream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
