import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createHmac } from 'crypto'

function verifyToken(email: string, token: string): boolean {
  const expected = createHmac('sha256', process.env.CRON_SECRET ?? '')
    .update(email)
    .digest('hex')
  return expected === token
}

export async function GET(req: NextRequest) {
  if (!process.env.RESEND_API_KEY)
    return new NextResponse('Service unavailable.', { status: 503 })

  const resend = new Resend(process.env.RESEND_API_KEY)

  const { searchParams } = req.nextUrl
  const email = searchParams.get('e')
  const token = searchParams.get('t')

  if (!email || !token || !verifyToken(email, token)) {
    return new NextResponse('Invalid unsubscribe link.', { status: 400 })
  }

  const { error } = await resend.contacts.update({ email, unsubscribed: true })
  if (error) {
    console.error('[unsubscribe]', error)
    return new NextResponse('Something went wrong. Please try again.', {
      status: 500,
    })
  }

  return new NextResponse(
    `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Unsubscribed</title>
<style>body{margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f8fafc;display:flex;align-items:center;justify-content:center;min-height:100vh}
.card{background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:40px;max-width:400px;text-align:center}
h1{margin:0 0 8px;font-size:20px;color:#0c161d}p{margin:0 0 20px;color:#64748b;font-size:14px}
a{color:#2c4b68;font-size:14px}</style></head>
<body><div class="card">
  <h1>Unsubscribed</h1>
  <p>You've been removed from Gopalji Gaur's newsletter. You won't receive any more emails.</p>
  <a href="https://gopalji.me">← Back to gopalji.me</a>
</div></body></html>`,
    { headers: { 'Content-Type': 'text/html' } },
  )
}
