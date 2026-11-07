'use client'

import { useState } from 'react'
import {
  advancePromotion,
  completedTrials,
  lateTrials,
  promotionCandidates,
  type SelectionRule,
  type Trial,
} from 'app/lib/promotion-demo'
import styles from './promotion-explorer.module.css'

function TrialStrip({
  trials,
  promoted,
  rule,
}: {
  trials: Trial[]
  promoted: string[]
  rule: SelectionRule
}) {
  const { eligible } = promotionCandidates(trials, promoted, rule)
  return (
    <div
      className={`${styles.trials} ${trials.length === 4 ? styles.four : ''}`}
      role="list"
      aria-label="Trial results, lower loss is better"
    >
      {trials.map((trial) => {
        const sent = promoted.includes(trial.id)
        const selected = eligible.some((item) => item.id === trial.id)
        const removed = sent && rule === 'remove-first'
        const state = sent
          ? 'promoted'
          : trial.loss === null
            ? 'pending'
            : selected
              ? 'eligible'
              : 'waiting'
        return (
          <div
            key={trial.id}
            role="listitem"
            aria-label={`Trial ${trial.id}, loss ${trial.loss ?? 'pending'}, ${state}${removed ? ', removed from comparison' : ''}`}
            className={[
              styles.trial,
              sent ? styles.sent : '',
              selected ? styles.eligible : '',
              removed ? styles.removed : '',
              trial.loss === null ? styles.pending : '',
            ].join(' ')}
          >
            <b>{trial.id}</b>
            <span className={styles.loss}>
              {trial.loss === null ? '…' : trial.loss.toFixed(1)}
            </span>
            <span className={styles.state} aria-hidden="true">
              {sent ? '✓' : selected ? '↑' : '·'}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export function PromotionExplorer() {
  const [ranked, setRanked] = useState<string[]>([])
  const [removed, setRemoved] = useState<string[]>([])
  const [step, setStep] = useState(0)
  const left = promotionCandidates(completedTrials, ranked, 'rank-first')
  const right = promotionCandidates(completedTrials, removed, 'remove-first')
  const finished = !left.next && !right.next
  const rows = [
    {
      rule: 'rank-first' as const,
      title: 'Rank all results, then exclude promotions',
      promoted: ranked,
      selection: left,
    },
    {
      rule: 'remove-first' as const,
      title: 'Remove promotions, then rank what remains',
      promoted: removed,
      selection: right,
    },
  ]
  return (
    <figure className={styles.figure} aria-label="Compare promotion order">
      <div className={styles.eyebrow}>
        One rung · nine completed trials · keep one third
      </div>
      <div className={styles.intro}>
        Allocate one worker at a time. Both rules begin with the same losses.
      </div>
      {rows.map(({ rule, title, promoted, selection }) => (
        <div className={styles.row} key={rule}>
          <div className={styles.heading}>
            <b>{title}</b>
            <span className={styles.count}>{promoted.length} promoted</span>
          </div>
          <TrialStrip
            trials={completedTrials}
            promoted={promoted}
            rule={rule}
          />
          <div className={styles.explanation}>
            {selection.population.length} results compared ÷ 3 → top{' '}
            {selection.quota}.{' '}
            {selection.next
              ? `Next: ${selection.next}.`
              : 'No eligible trial left. Start a new trial.'}
          </div>
        </div>
      ))}
      <div className={styles.controls}>
        <button
          type="button"
          disabled={finished}
          onClick={() => {
            setRanked(advancePromotion(completedTrials, ranked, 'rank-first'))
            setRemoved(
              advancePromotion(completedTrials, removed, 'remove-first'),
            )
            setStep(step + 1)
          }}
        >
          Next allocation
        </button>
        <button
          type="button"
          onClick={() => {
            setRanked([])
            setRemoved([])
            setStep(0)
          }}
        >
          Reset comparison
        </button>
      </div>
      <div className={styles.status} aria-live="polite">
        {step === 0
          ? 'The arrows mark eligible trials. Promote A and watch whether its result stays in the comparison.'
          : step < 3
            ? 'Both rules still choose the same trial. One keeps the winning results; the other removes them.'
            : step === 3
              ? 'A, B and C are promoted. The first rule is done. The second now considers D and E eligible, without receiving any new evidence.'
              : finished
                ? 'Same losses throughout: three promotions under the first rule, seven under the second.'
                : 'The comparison group keeps shrinking. A trial outside the original top third becomes the best remaining trial.'}
      </div>
      <figcaption className={styles.caption}>
        ↑ eligible · ✓ promoted · crossed-out results no longer counted.
        Deterministic teaching model of the scalar rules; this does not execute
        NePS or train a model.
      </figcaption>
    </figure>
  )
}

export function ArrivalExplorer() {
  const [arrived, setArrived] = useState(false)
  const [promoted, setPromoted] = useState<string[]>([])
  const trials = lateTrials.map((trial) =>
    trial.id === 'D' && arrived ? { ...trial, loss: 0.1 } : trial,
  )
  const { next, quota, population } = promotionCandidates(
    trials,
    promoted,
    'rank-first',
  )
  return (
    <figure className={styles.figure} aria-label="Explore a late result">
      <div className={styles.eyebrow}>A better result arrives later</div>
      <div className={styles.intro}>
        A, B and C have finished. D is still running. Try promoting A before
        finishing D.
      </div>
      <TrialStrip trials={trials} promoted={promoted} rule="rank-first" />
      <div className={styles.explanation}>
        {population.length} completed results → top {quota}. Already promoted:{' '}
        {promoted.join(', ') || 'none'}.
      </div>
      <div className={styles.controls}>
        <button
          type="button"
          disabled={!next}
          onClick={() =>
            setPromoted(advancePromotion(trials, promoted, 'rank-first'))
          }
        >
          {next ? `Promote ${next}` : 'No eligible promotion'}
        </button>
        <button
          type="button"
          disabled={arrived}
          onClick={() => setArrived(true)}
        >
          Finish D: loss 0.1
        </button>
        <button
          type="button"
          onClick={() => {
            setArrived(false)
            setPromoted([])
          }}
        >
          Reset arrivals
        </button>
      </div>
      <div className={styles.status} aria-live="polite">
        {!arrived
          ? 'D has no result, so it contributes neither a score nor a place in the quota.'
          : promoted.includes('A') && promoted.includes('D')
            ? 'Two of four trials have now been promoted. Both decisions were valid when made. A fixed one-in-three lifetime cap would reject D.'
            : promoted.includes('A')
              ? 'D is now best. A stays in the evidence, but is no longer in the top third. D is eligible even though A was already promoted.'
              : 'D finished before A was promoted, so D gets the first promotion. Reset and reverse the event order to compare.'}
      </div>
      <figcaption className={styles.caption}>
        Only arrival order changes. Losses are fixed; lower is better. One
        scalar-loss rung, reduction factor three.
      </figcaption>
    </figure>
  )
}

export function PromotionEquation() {
  return (
    <div
      className={styles.formula}
      aria-label="For a fixed completed cohort, rank first promotes floor N over eta; remove first promotes N minus eta plus one when N is at least eta."
    >
      <div>Rank first: P = ⌊N / η⌋</div>
      <div>Remove first: P = N − η + 1, for N ≥ η</div>
    </div>
  )
}
