/**
 * Pre-computes Gemini embeddings for all site content.
 * Run with: pnpm embed
 * Requires GEMINI_API_KEY in .env or environment.
 */

import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { profile, profileText } from '../app/lib/profile.js'

const API_KEY = process.env.GEMINI_API_KEY
if (!API_KEY) throw new Error('GEMINI_API_KEY is not set')

type EmbeddingItem = {
  id: string
  type: 'blog' | 'project' | 'profile' | 'contact'
  title: string
  url: string
  text: string
  embedding: number[]
}

async function embed(text: string): Promise<number[]> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'models/gemini-embedding-001',
        content: { parts: [{ text }] },
      }),
    },
  )
  if (!res.ok)
    throw new Error(`Embedding API error: ${res.status} ${await res.text()}`)
  const data = (await res.json()) as { embedding: { values: number[] } }
  return data.embedding.values
}

async function main() {
  const items: EmbeddingItem[] = []
  const root = process.cwd()

  // Profile — homepage identity info
  items.push({
    id: 'profile',
    type: 'profile',
    title: profile.name,
    url: '/',
    text: profileText,
    embedding: await embed(profileText),
  })
  // Blog posts — title + summary + tags (not full content)
  const postsDir = path.join(root, 'app/blog/posts')
  for (const file of fs
    .readdirSync(postsDir)
    .filter((f) => f.endsWith('.mdx'))) {
    const raw = fs.readFileSync(path.join(postsDir, file), 'utf-8')
    const { data } = matter(raw)
    const slug = file.replace(/\.mdx$/, '')
    const tags = Array.isArray(data.tags)
      ? data.tags.join(', ')
      : (data.tags ?? '')
    const text = [data.summary, tags].filter(Boolean).join('. ')
    items.push({
      id: `blog-${slug}`,
      type: 'blog',
      title: data.title ?? slug,
      url: `/blog/${slug}`,
      text,
      embedding: await embed(text),
    })
    console.log(`✓ blog: ${data.title}`)
  }

  // Projects
  const { projects } = await import('../app/projects/data.js')
  for (const p of projects) {
    const text = [p.summary, (p.techStack ?? []).join(', ')]
      .filter(Boolean)
      .join('. ')
    const url = p.links?.[0]?.href ?? '/projects'
    items.push({
      id: `project-${p.title.toLowerCase().replace(/\s+/g, '-')}`,
      type: 'project',
      title: p.title,
      url,
      text,
      embedding: await embed(text),
    })
    console.log(`✓ project: ${p.title}`)
  }

  // Contact links
  const contactLinks = [
    {
      id: 'contact-email',
      title: 'Email',
      text: `Email Gopalji at ${profile.contact.email}`,
      url: `mailto:${profile.contact.email}`,
    },
    {
      id: 'contact-github',
      title: 'GitHub',
      text: `Gopalji's GitHub profile: ${profile.contact.github}`,
      url: profile.contact.github,
    },
    {
      id: 'contact-linkedin',
      title: 'LinkedIn',
      text: `Gopalji's LinkedIn profile: ${profile.contact.linkedin}`,
      url: profile.contact.linkedin,
    },
    {
      id: 'contact-resume',
      title: 'Resume',
      text: `Gopalji's resume / CV: ${profile.contact.resume}`,
      url: profile.contact.resume,
    },
  ]
  for (const link of contactLinks) {
    items.push({ ...link, type: 'contact', embedding: await embed(link.text) })
  }

  fs.writeFileSync(
    path.join(root, 'content/embeddings.json'),
    JSON.stringify(items, null, 2),
  )
  console.log(`\nWrote ${items.length} items to content/embeddings.json`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
