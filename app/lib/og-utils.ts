export function decodeHtml(str: string): string {
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

export function extractOg(
  html: string,
  baseUrl: string,
): { title: string | null; description: string | null; image: string | null } {
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

  if (image && !image.startsWith('http')) {
    try {
      image = new URL(image, baseUrl).href
    } catch {
      image = null
    }
  }

  return { title, description, image }
}
