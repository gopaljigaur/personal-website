import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url')
  if (!url || !url.startsWith('https://gist.github.com/')) {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
  }

  // Extract gist ID from URL: https://gist.github.com/{user}/{id}
  const gistId = url.split('/').pop()
  if (!gistId) {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
  }

  const res = await fetch(`https://api.github.com/gists/${gistId}`, {
    headers: {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    next: { revalidate: 3600 },
  })

  if (!res.ok) {
    return NextResponse.json({ error: 'Fetch failed' }, { status: res.status })
  }

  const data = await res.json()

  // GitHub REST API returns files as object keyed by filename; normalize to array
  const files = Object.values(data.files ?? {}) as {
    filename: string
    content: string
    language: string
  }[]

  return NextResponse.json({ files })
}
