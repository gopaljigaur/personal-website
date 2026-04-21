import { describe, it, expect } from 'vitest'
import { extractHeadings, getRelatedPosts } from 'app/blog/utils'
import type { BlogPost } from 'app/blog/utils.shared'

describe('extractHeadings', () => {
  it('extracts h2 headings', () => {
    const result = extractHeadings('## Hello World')
    expect(result).toEqual([
      { level: 2, text: 'Hello World', id: 'hello-world' },
    ])
  })

  it('extracts h3 and h4 headings', () => {
    const md = '### Section\n#### Sub-section'
    const result = extractHeadings(md)
    expect(result).toHaveLength(2)
    expect(result[0]).toMatchObject({ level: 3, text: 'Section' })
    expect(result[1]).toMatchObject({ level: 4, text: 'Sub-section' })
  })

  it('ignores h1 headings', () => {
    expect(extractHeadings('# Title\n## Subtitle')).toHaveLength(1)
  })

  it('ignores headings deeper than h4', () => {
    expect(extractHeadings('##### Deep')).toHaveLength(0)
  })

  it('generates correct slugified ids', () => {
    const result = extractHeadings('## What is Next.js?')
    expect(result[0].id).toBe('what-is-nextjs')
  })

  it('returns empty array for no headings', () => {
    expect(extractHeadings('Just a paragraph.')).toEqual([])
  })
})

const makePosts = (overrides: Partial<BlogPost>[] = []): BlogPost[] =>
  overrides.map((o, i) => ({
    slug: `post-${i}`,
    content: '',
    metadata: {
      title: `Post ${i}`,
      publishedAt: '2024-01-01',
      summary: '',
      tags: [],
      ...o.metadata,
    },
    ...o,
  }))

describe('getRelatedPosts', () => {
  it('returns empty when current post has no tags', () => {
    const posts = makePosts([
      { slug: 'other', metadata: { tags: ['a'] } as never },
    ])
    expect(getRelatedPosts('current', [], posts)).toEqual([])
  })

  it('excludes current post', () => {
    const posts = makePosts([
      { slug: 'current', metadata: { tags: ['a'] } as never },
    ])
    expect(getRelatedPosts('current', ['a'], posts)).toEqual([])
  })

  it('ranks by shared tag count', () => {
    const posts: BlogPost[] = [
      {
        slug: 'a',
        content: '',
        metadata: { title: 'A', publishedAt: '', summary: '', tags: ['x'] },
      },
      {
        slug: 'b',
        content: '',
        metadata: {
          title: 'B',
          publishedAt: '',
          summary: '',
          tags: ['x', 'y'],
        },
      },
    ]
    const result = getRelatedPosts('current', ['x', 'y'], posts)
    expect(result[0].slug).toBe('b')
    expect(result[1].slug).toBe('a')
  })

  it('excludes posts with no shared tags', () => {
    const posts: BlogPost[] = [
      {
        slug: 'a',
        content: '',
        metadata: { title: 'A', publishedAt: '', summary: '', tags: ['z'] },
      },
    ]
    expect(getRelatedPosts('current', ['x'], posts)).toEqual([])
  })

  it('respects limit', () => {
    const posts: BlogPost[] = Array.from({ length: 5 }, (_, i) => ({
      slug: `p${i}`,
      content: '',
      metadata: { title: `P${i}`, publishedAt: '', summary: '', tags: ['x'] },
    }))
    expect(getRelatedPosts('current', ['x'], posts, 2)).toHaveLength(2)
  })
})
