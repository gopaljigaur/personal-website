import { describe, it, expect } from 'vitest'
import { decodeHtml, extractOg } from 'app/lib/og-utils'

describe('decodeHtml', () => {
  it('decodes &amp;', () =>
    expect(decodeHtml('Cats &amp; Dogs')).toBe('Cats & Dogs'))
  it('decodes &lt; and &gt;', () => expect(decodeHtml('&lt;b&gt;')).toBe('<b>'))
  it('decodes &quot;', () =>
    expect(decodeHtml('say &quot;hello&quot;')).toBe('say "hello"'))
  it('decodes &#39;', () => expect(decodeHtml('it&#39;s')).toBe("it's"))
  it('decodes &nbsp;', () => expect(decodeHtml('foo&nbsp;bar')).toBe('foo bar'))
  it('decodes numeric entities', () => expect(decodeHtml('&#65;')).toBe('A'))
  it('returns plain strings unchanged', () =>
    expect(decodeHtml('hello world')).toBe('hello world'))
})

describe('extractOg', () => {
  const base = 'https://example.com'

  it('extracts og:title', () => {
    const html = `<meta property="og:title" content="My Page" />`
    expect(extractOg(html, base).title).toBe('My Page')
  })

  it('falls back to <title> tag', () => {
    const html = `<title>Fallback Title</title>`
    expect(extractOg(html, base).title).toBe('Fallback Title')
  })

  it('extracts og:description', () => {
    const html = `<meta property="og:description" content="A desc" />`
    expect(extractOg(html, base).description).toBe('A desc')
  })

  it('falls back to meta name=description', () => {
    const html = `<meta name="description" content="Plain desc" />`
    expect(extractOg(html, base).description).toBe('Plain desc')
  })

  it('extracts og:image', () => {
    const html = `<meta property="og:image" content="https://cdn.example.com/img.jpg" />`
    expect(extractOg(html, base).image).toBe('https://cdn.example.com/img.jpg')
  })

  it('resolves relative image URL', () => {
    const html = `<meta property="og:image" content="/images/hero.jpg" />`
    expect(extractOg(html, base).image).toBe(
      'https://example.com/images/hero.jpg',
    )
  })

  it('returns null for missing fields', () => {
    const { title, description, image } = extractOg('<html></html>', base)
    expect(title).toBeNull()
    expect(description).toBeNull()
    expect(image).toBeNull()
  })

  it('decodes HTML entities in values', () => {
    const html = `<meta property="og:title" content="Cats &amp; Dogs" />`
    expect(extractOg(html, base).title).toBe('Cats & Dogs')
  })

  it('handles reversed attribute order', () => {
    const html = `<meta content="Reversed" property="og:title" />`
    expect(extractOg(html, base).title).toBe('Reversed')
  })
})
