import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'
import { createHash } from 'crypto'

const CACHE_TTL = 60 * 60 * 24 * 7 // 7 days
const RATE_LIMIT = 60 // per IP per hour
const FETCH_TIMEOUT = 5000

const BLOCKED_HOSTS =
  /^(localhost|127\.|0\.0\.0\.0|10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|::1|fc00)/i

async function checkRateLimit(ip: string): Promise<boolean> {
  try {
    const key = `rl:og:${ip}`
    const count = await kv.incr(key)
    if (count === 1) await kv.expire(key, 3600)
    return count <= RATE_LIMIT
  } catch {
    return true
  }
}

function decodeHtml(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
}

function extractOg(html: string, baseUrl: string) {
  const get = (pattern: RegExp) => {
    const val = pattern.exec(html)?.[1]?.trim() ?? null
    return val ? decodeHtml(val) : null
  }

  const title =
    get(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i) ??
    get(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i) ??
    get(/<title[^>]*>([^<]+)<\/title>/i)

  const description =
    get(
      /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i,
    ) ??
    get(
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description["']/i,
    ) ??
    get(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i) ??
    get(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i)

  let image =
    get(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ??
    get(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i)

  // Resolve relative image URLs
  if (image && !image.startsWith('http')) {
    try {
      image = new URL(image, baseUrl).href
    } catch {
      image = null
    }
  }

  return { title, description, image }
}

export async function GET(request: NextRequest) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'anonymous'
  if (!(await checkRateLimit(ip)))
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

  const url = request.nextUrl.searchParams.get('url')
  if (!url) return NextResponse.json({ error: 'Missing url' }, { status: 400 })

  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return NextResponse.json({ error: 'Invalid url' }, { status: 400 })
  }

  if (!['http:', 'https:'].includes(parsed.protocol))
    return NextResponse.json({ error: 'Invalid protocol' }, { status: 400 })

  if (BLOCKED_HOSTS.test(parsed.hostname))
    return NextResponse.json({ error: 'Blocked host' }, { status: 400 })

  const cacheKey = `og:${createHash('sha256').update(url).digest('hex').slice(0, 16)}`

  try {
    const cached = await kv.get<object>(cacheKey)
    if (cached) return NextResponse.json(cached)
  } catch {}

  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT)

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
    })
    clearTimeout(timer)

    const html = await res.text()
    const { title, description, image } = extractOg(html, url)
    const domain = parsed.hostname.replace(/^www\./, '')
    const favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`

    const data = { title, description, image, domain, favicon }

    try {
      await kv.set(cacheKey, data, { ex: CACHE_TTL })
    } catch {}

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Fetch failed' }, { status: 502 })
  }
}
