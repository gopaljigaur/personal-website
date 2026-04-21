import { NextRequest } from 'next/server'
import { Resend } from 'resend'

export async function POST(request: NextRequest) {
  if (!process.env.RESEND_API_KEY)
    return new Response('Service unavailable', { status: 503 })

  const resend = new Resend(process.env.RESEND_API_KEY)

  let body: { name: string; email: string; question: string }
  try {
    body = await request.json()
  } catch {
    return new Response('Invalid JSON', { status: 400 })
  }

  const { name, email, question } = body
  if (!name || !email || !question)
    return new Response('Missing fields', { status: 400 })

  try {
    await resend.emails.send({
      from: 'contact@gopalji.me',
      to: 'contact@gopalji.me',
      replyTo: email,
      subject: `Question from ${name} via gopalji.me`,
      text: `Name: ${name}\nEmail: ${email}\n\nQuestion:\n${question}`,
    })

    return new Response('OK', { status: 200 })
  } catch (err) {
    console.error('[contact] send error:', err)
    return new Response('Failed to send', { status: 500 })
  }
}
