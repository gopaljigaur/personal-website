// Pure utilities — safe to import in both server and client components

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/&/g, '-and-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
}

export type Metadata = {
  title: string
  publishedAt: string
  summary: string
  image?: string
  tags?: string[]
}

export type BlogPost = {
  metadata: Metadata
  slug: string
  content: string
}

export type Heading = {
  level: number
  text: string
  id: string
}

export function formatDate(date: string, includeRelative = false) {
  const currentDate = new Date()
  if (!date.includes('T')) date = `${date}T00:00:00`
  const targetDate = new Date(date)

  const yearsAgo = currentDate.getFullYear() - targetDate.getFullYear()
  const monthsAgo = currentDate.getMonth() - targetDate.getMonth()
  const daysAgo = currentDate.getDate() - targetDate.getDate()

  let formattedDate: string
  if (yearsAgo > 0) formattedDate = `${yearsAgo}y ago`
  else if (monthsAgo > 0) formattedDate = `${monthsAgo}mo ago`
  else if (daysAgo > 0) formattedDate = `${daysAgo}d ago`
  else formattedDate = 'Today'

  const fullDate = targetDate.toLocaleString('en-us', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return includeRelative ? `${fullDate} (${formattedDate})` : fullDate
}
