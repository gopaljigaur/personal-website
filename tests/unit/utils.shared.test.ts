import { describe, it, expect, vi, beforeEach } from 'vitest'
import { slugify, formatDate } from 'app/blog/utils.shared'

describe('slugify', () => {
  it('lowercases and replaces spaces with dashes', () => {
    expect(slugify('Hello World')).toBe('hello-world')
  })

  it('replaces & with -and-', () => {
    // spaces→dashes first, then &→-and-, then --+ collapsed
    expect(slugify('Cats & Dogs')).toBe('cats-and-dogs')
  })

  it('strips non-word characters', () => {
    expect(slugify('What is Next.js?')).toBe('what-is-nextjs')
  })

  it('collapses multiple dashes', () => {
    expect(slugify('foo---bar')).toBe('foo-bar')
  })

  it('trims leading/trailing whitespace', () => {
    expect(slugify('  hello  ')).toBe('hello')
  })

  it('handles empty string', () => {
    expect(slugify('')).toBe('')
  })
})

describe('formatDate', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-06-15'))
  })

  it('formats date as "Month Day, Year"', () => {
    expect(formatDate('2024-01-10')).toBe('January 10, 2024')
  })

  it('shows years ago when more than a year', () => {
    expect(formatDate('2022-06-14', true)).toContain('2y ago')
  })

  it('shows months ago', () => {
    expect(formatDate('2024-03-01', true)).toContain('3mo ago')
  })

  it('shows days ago', () => {
    expect(formatDate('2024-06-10', true)).toContain('5d ago')
  })

  it('shows Today for same day', () => {
    expect(formatDate('2024-06-15', true)).toContain('Today')
  })

  it('without relative flag returns only full date', () => {
    const result = formatDate('2024-01-01', false)
    expect(result).toBe('January 1, 2024')
    expect(result).not.toContain('ago')
  })
})
