// Teaching model for one scalar-loss rung, not a production scheduler.
export type Trial = { id: string; loss: number | null }
export type SelectionRule = 'rank-first' | 'remove-first'

export function promotionCandidates(
  trials: Trial[],
  promoted: string[],
  rule: SelectionRule,
  eta = 3,
) {
  const completed = trials.filter((trial) => trial.loss !== null)
  const population =
    rule === 'rank-first'
      ? completed
      : completed.filter((trial) => !promoted.includes(trial.id))
  const quota = Math.floor(population.length / eta)
  const ranked = [...population].sort((a, b) => a.loss! - b.loss!)
  const eligible = ranked
    .slice(0, quota)
    .filter((trial) => !promoted.includes(trial.id))
  return { population, quota, eligible, next: eligible[0]?.id ?? null }
}

export function advancePromotion(
  trials: Trial[],
  promoted: string[],
  rule: SelectionRule,
) {
  const { next } = promotionCandidates(trials, promoted, rule)
  return next === null ? promoted : [...promoted, next]
}

export const completedTrials: Trial[] = Array.from({ length: 9 }, (_, i) => ({
  id: String.fromCharCode(65 + i),
  loss: (i + 1) / 10,
}))

export const lateTrials: Trial[] = [
  { id: 'A', loss: 0.6 },
  { id: 'B', loss: 0.7 },
  { id: 'C', loss: 0.8 },
  { id: 'D', loss: null },
]
