import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock @vercel/kv before importing route
vi.mock('@vercel/kv', () => ({
  kv: {
    incr: vi.fn().mockResolvedValue(1),
    expire: vi.fn().mockResolvedValue(1),
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue('OK'),
  },
}))

const { GET } = await import('app/api/og-preview/route')

function makeRequest(url: string, ip = '1.2.3.4') {
  return new NextRequest(
    `http://localhost/api/og-preview?url=${encodeURIComponent(url)}`,
    {
      headers: { 'x-forwarded-for': ip },
    },
  )
}

describe('GET /api/og-preview', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns 400 for missing url param', async () => {
    const req = new NextRequest('http://localhost/api/og-preview', {
      headers: { 'x-forwarded-for': '1.2.3.4' },
    })
    const res = await GET(req)
    expect(res.status).toBe(400)
  })

  it('returns 400 for invalid URL', async () => {
    const res = await GET(makeRequest('not-a-url'))
    expect(res.status).toBe(400)
  })

  it('returns 400 for non-http protocol', async () => {
    const res = await GET(makeRequest('ftp://example.com'))
    expect(res.status).toBe(400)
  })

  it('returns 400 for blocked private host (localhost)', async () => {
    const res = await GET(makeRequest('http://localhost/secret'))
    expect(res.status).toBe(400)
  })

  it('returns 400 for 192.168.x.x', async () => {
    const res = await GET(makeRequest('http://192.168.1.1/data'))
    expect(res.status).toBe(400)
  })

  it('fetches and parses OG data for valid external URL', async () => {
    const html = `
      <html><head>
        <title>Test Page</title>
        <meta property="og:title" content="OG Title" />
        <meta property="og:description" content="OG Desc" />
        <meta property="og:image" content="https://cdn.example.com/img.jpg" />
      </head></html>
    `
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(html, {
        status: 200,
        headers: { 'content-type': 'text/html' },
      }),
    )

    const res = await GET(makeRequest('https://example.com/page'))
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.title).toBe('OG Title')
    expect(data.description).toBe('OG Desc')
    expect(data.image).toBe('https://cdn.example.com/img.jpg')
    expect(data.domain).toBe('example.com')
  })

  it('returns 502 when fetch throws', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'))
    const res = await GET(makeRequest('https://example.com'))
    expect(res.status).toBe(502)
  })

  it('returns cached data without re-fetching', async () => {
    const { kv } = await import('@vercel/kv')
    vi.mocked(kv.get).mockResolvedValueOnce({
      title: 'Cached',
      description: null,
      image: null,
      domain: 'example.com',
      favicon: 'https://www.google.com/s2/favicons?domain=example.com&sz=32',
    })

    const res = await GET(makeRequest('https://example.com'))
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.title).toBe('Cached')
    expect(fetch).not.toHaveBeenCalled()
  })
})
