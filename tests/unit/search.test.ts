import { describe, it, expect } from 'vitest'
import { dot } from 'app/lib/search'

describe('dot', () => {
  it('computes dot product of equal-length vectors', () => {
    expect(dot([1, 2, 3], [4, 5, 6])).toBe(32)
  })

  it('returns 0 for zero vectors', () => {
    expect(dot([0, 0, 0], [1, 2, 3])).toBe(0)
  })

  it('handles negative values', () => {
    expect(dot([-1, 2], [3, -4])).toBe(-11)
  })

  it('returns 0 for empty vectors', () => {
    expect(dot([], [])).toBe(0)
  })

  it('handles unit vectors (cosine similarity)', () => {
    const a = [1, 0]
    const b = [0, 1]
    expect(dot(a, b)).toBe(0)
  })

  it('computes similarity of identical unit vectors as 1', () => {
    const v = [1 / Math.sqrt(2), 1 / Math.sqrt(2)]
    expect(dot(v, v)).toBeCloseTo(1)
  })
})
