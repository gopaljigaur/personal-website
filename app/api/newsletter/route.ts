import { Resend } from 'resend'
import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'

const RATE_LIMIT = 5 // per IP per hour

async function checkRateLimit(ip: string): Promise<boolean> {
  try {
    const key = `rl:nl:${ip}`
    const count = await kv.incr(key)
    if (count === 1) await kv.expire(key, 3600)
    return count <= RATE_LIMIT
  } catch {
    return true
  }
}

export async function POST(req: NextRequest) {
  if (!process.env.RESEND_API_KEY)
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })

  const resend = new Resend(process.env.RESEND_API_KEY)

  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'anonymous'
  if (!(await checkRateLimit(ip)))
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

  const { email } = await req.json()

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  }

  const { error } = await resend.contacts.create({ email, unsubscribed: false })
  if (error) {
    console.error('[newsletter]', error)
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
