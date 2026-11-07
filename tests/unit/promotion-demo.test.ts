import { describe, expect, it } from 'vitest'
import {
  advancePromotion,
  completedTrials,
  lateTrials,
  promotionCandidates,
  type SelectionRule,
} from '../../app/lib/promotion-demo'

function exhaust(rule: SelectionRule) {
  let promoted: string[] = []
  for (let i = 0; i < 10; i++) {
    const next = advancePromotion(completedTrials, promoted, rule)
    if (next === promoted) return promoted
    promoted = next
  }
  throw new Error('The fixed cohort never exhausted its eligible trials')
}

describe('the article’s scheduler examples', () => {
  it('matches the observed scalar cohort: three versus seven promotions', () => {
    expect(exhaust('rank-first')).toEqual(['A', 'B', 'C'])
    expect(exhaust('remove-first')).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G'])
  })

  it('retains promoted results as evidence without allocating them again', () => {
    const state = promotionCandidates(
      completedTrials,
      ['A', 'B', 'C'],
      'rank-first',
    )
    expect(state.population).toHaveLength(9)
    expect(state.quota).toBe(3)
    expect(state.next).toBeNull()
  })

  it('allows a better late arrival despite an earlier valid promotion', () => {
    const before = advancePromotion(lateTrials, [], 'rank-first')
    expect(before).toEqual(['A'])
    const after = lateTrials.map((t) =>
      t.id === 'D' ? { ...t, loss: 0.1 } : t,
    )
    expect(advancePromotion(after, before, 'rank-first')).toEqual(['A', 'D'])
    // Same scores, different arrival history: D would have been selected first.
    expect(advancePromotion(after, [], 'rank-first')).toEqual(['D'])
  })

  it('does not count pending results toward the quota', () => {
    const pending = completedTrials.map((trial, i) => ({
      ...trial,
      loss: i < 2 ? trial.loss : null,
    }))
    for (const rule of ['rank-first', 'remove-first'] as const) {
      expect(promotionCandidates(pending, [], rule).quota).toBe(0)
      expect(advancePromotion(pending, [], rule)).toEqual([])
    }
  })

  it('preserves source results when computing ranks', () => {
    const source = [...completedTrials].reverse()
    promotionCandidates(source, [], 'rank-first')
    expect(source[0].id).toBe('I')
  })
})
