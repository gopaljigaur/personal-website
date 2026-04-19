import { Resend } from 'resend'
import { NextRequest, NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  const { email } = await req.json()

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  }

  const audienceId = process.env.RESEND_AUDIENCE_ID
  if (!audienceId) {
    return NextResponse.json(
      { error: 'Newsletter not configured' },
      { status: 503 },
    )
  }

  try {
    await resend.contacts.create({ email, audienceId, unsubscribed: false })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 })
  }
}
