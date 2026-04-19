import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

const TAG_COLORS: Record<string, { bg: string; text: string }> = {
  ml: { bg: '#1e1b4b', text: '#a5b4fc' },
  ai: { bg: '#1e1b4b', text: '#a5b4fc' },
  python: { bg: '#14532d', text: '#86efac' },
  typescript: { bg: '#0c4a6e', text: '#7dd3fc' },
  react: { bg: '#0c4a6e', text: '#7dd3fc' },
  nextjs: { bg: '#171717', text: '#a3a3a3' },
  web: { bg: '#292524', text: '#d6d3d1' },
}

function tagStyle(tag: string) {
  const key = tag.toLowerCase().replace(/[^a-z]/g, '')
  return TAG_COLORS[key] ?? { bg: '#262626', text: '#a3a3a3' }
}

export function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const title = searchParams.get('title') || 'Gopalji Gaur'
  const subtitle = searchParams.get('subtitle') || ''
  const rawTags = searchParams.get('tags') || ''
  const tags = rawTags
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 4)

  const truncatedSubtitle =
    subtitle.length > 140 ? subtitle.slice(0, 137) + '…' : subtitle

  return new ImageResponse(
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        backgroundColor: '#09090b',
        padding: '56px 64px',
        fontFamily: 'sans-serif',
      }}
    >
      {/* Top: site URL */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginBottom: '32px',
        }}
      >
        <span style={{ color: '#52525b', fontSize: 16 }}>gopalji.me</span>
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {tags.map((tag) => {
            const { bg, text } = tagStyle(tag)
            return (
              <div
                key={tag}
                style={{
                  display: 'flex',
                  padding: '4px 12px',
                  backgroundColor: bg,
                  borderRadius: 9999,
                  color: text,
                  fontSize: 14,
                  fontWeight: 500,
                }}
              >
                {tag}
              </div>
            )
          })}
        </div>
      )}

      {/* Title */}
      <div
        style={{
          display: 'flex',
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            color: '#fafafa',
            fontSize: title.length > 50 ? 52 : 62,
            fontWeight: 700,
            lineHeight: 1.1,
            maxWidth: 900,
          }}
        >
          {title}
        </div>
        {truncatedSubtitle && (
          <div
            style={{
              color: '#71717a',
              fontSize: 22,
              marginTop: 20,
              maxWidth: 820,
              lineHeight: 1.5,
            }}
          >
            {truncatedSubtitle}
          </div>
        )}
      </div>

      {/* Divider */}
      <div
        style={{
          height: 1,
          backgroundColor: '#27272a',
          marginTop: 32,
          marginBottom: 24,
        }}
      />

      {/* Author row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              display: 'flex',
              width: 48,
              height: 48,
              borderRadius: 9999,
              backgroundColor: '#7c3aed',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 20,
              fontWeight: 700,
            }}
          >
            G
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ color: '#fafafa', fontSize: 16, fontWeight: 600 }}>
              Gopalji Gaur
            </span>
            <span style={{ color: '#71717a', fontSize: 14 }}>
              Machine Learning Engineer
            </span>
          </div>
        </div>
      </div>
    </div>,
    { width: 1200, height: 630 },
  )
}
