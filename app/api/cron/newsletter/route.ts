import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { kv } from '@vercel/kv'
import { createHmac } from 'crypto'
import { getBlogPosts } from 'app/blog/utils'

const KV_KEY = 'nl:last_sent_slug'
const SITE_URL = 'https://gopalji.me'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function GET(req: NextRequest) {
  if (!process.env.RESEND_API_KEY)
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })

  const resend = new Resend(process.env.RESEND_API_KEY)

  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const posts = getBlogPosts().sort(
    (a, b) =>
      new Date(b.metadata.publishedAt).getTime() -
      new Date(a.metadata.publishedAt).getTime(),
  )
  const latest = posts[0]
  if (!latest) return NextResponse.json({ ok: true, skipped: 'no posts' })

  const lastSentSlug = await kv.get<string>(KV_KEY).catch(() => null)
  if (lastSentSlug === latest.slug) {
    return NextResponse.json({ ok: true, skipped: 'already sent' })
  }

  const { data: contactsRes, error: listError } = await resend.contacts.list()
  if (listError) {
    console.error('[cron/newsletter] list error:', listError)
    return NextResponse.json(
      { error: 'Failed to list contacts' },
      { status: 500 },
    )
  }

  const recipients = (contactsRes?.data ?? []).filter((c) => !c.unsubscribed)
  if (recipients.length === 0) {
    await kv.set(KV_KEY, latest.slug).catch(() => null)
    return NextResponse.json({ ok: true, skipped: 'no subscribers' })
  }

  const postUrl = `${SITE_URL}/blog/${latest.slug}`
  const { metadata } = latest

  const { error: sendError } = await resend.batch.send(
    recipients.map((c) => ({
      from: `Gopalji Gaur <newsletter@gopalji.me>`,
      to: c.email,
      subject: `New post: ${metadata.title}`,
      html: buildEmail({
        title: metadata.title,
        summary: metadata.summary,
        postUrl,
        tags: metadata.tags ?? [],
        unsubscribeUrl: buildUnsubscribeUrl(c.email),
      }),
    })),
  )

  if (sendError) {
    console.error('[cron/newsletter] send error:', sendError)
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 })
  }

  await kv.set(KV_KEY, latest.slug).catch(() => null)
  return NextResponse.json({
    ok: true,
    sent: recipients.length,
    post: latest.slug,
  })
}

function buildUnsubscribeUrl(email: string): string {
  const token = createHmac('sha256', process.env.CRON_SECRET ?? '')
    .update(email)
    .digest('hex')
  return `${SITE_URL}/api/newsletter/unsubscribe?e=${encodeURIComponent(email)}&t=${token}`
}

function buildEmail({
  title,
  summary,
  postUrl,
  tags,
  unsubscribeUrl,
}: {
  title: string
  summary: string
  postUrl: string
  tags: string[]
  unsubscribeUrl: string
}) {
  const tagHtml = tags.length
    ? `<p style="margin:0 0 20px">${tags.map((t) => `<span style="display:inline-block;background:#f1f5f9;color:#64748b;border-radius:999px;padding:2px 10px;font-size:12px;margin-right:4px">${t}</span>`).join('')}</p>`
    : ''

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 16px">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px">
        <tr><td style="padding-bottom:24px">
          <a href="${SITE_URL}" style="color:#2c4b68;font-size:14px;font-weight:600;text-decoration:none">gopalji.me</a>
        </td></tr>
        <tr><td style="background:#ffffff;border-radius:12px;padding:32px;border:1px solid #e2e8f0">
          <p style="margin:0 0 8px;font-size:12px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em">New post</p>
          <h1 style="margin:0 0 12px;font-size:22px;font-weight:600;color:#0c161d;line-height:1.3">${title}</h1>
          ${tagHtml}
          <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.6">${summary}</p>
          <a href="${postUrl}" style="display:inline-block;background:#2c4b68;color:#f8fafc;border-radius:8px;padding:10px 20px;font-size:14px;font-weight:500;text-decoration:none">Read post →</a>
        </td></tr>
        <tr><td style="padding-top:20px;text-align:center">
          <p style="margin:0 0 6px;font-size:12px;color:#94a3b8">This is a no-reply email. You're receiving this because you are subscribed to Gopalji Gaur's newsletter.</p>
          <a href="${unsubscribeUrl}" style="font-size:12px;color:#94a3b8">Unsubscribe</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}
