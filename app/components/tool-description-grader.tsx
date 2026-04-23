'use client'
import React, { useState, useMemo } from 'react'

interface Check {
  id: string
  label: string
  hint: string
  test: (s: string) => boolean
  weight: number
}

const CHECKS: Check[] = [
  {
    id: 'length',
    label: 'Adequate length',
    hint: 'At least 50 characters — one-liners never carry enough signal',
    test: (s) => s.trim().length >= 50,
    weight: 10,
  },
  {
    id: 'purpose',
    label: 'States what it does or returns',
    hint: 'Mention what the tool retrieves, creates, or produces',
    test: (s) =>
      /\b(returns?|fetches?|retrieves?|gets?|creates?|searches?|finds?|lists?|generates?|sends?|calculates?|extracts?|converts?)\b/i.test(
        s,
      ),
    weight: 20,
  },
  {
    id: 'when',
    label: 'Explains when to use it',
    hint: '"Use when...", "to get...", or a concrete use-case sentence',
    test: (s) =>
      /\b(use when|use this when|use for|when you (need|want|have)|to (get|find|create|retrieve|fetch|search)|for (getting|finding|searching|retrieving))\b/i.test(
        s,
      ),
    weight: 20,
  },
  {
    id: 'antipattern',
    label: 'Anti-patterns listed',
    hint: '"Do NOT use for X — use Y() instead"',
    test: (s) =>
      /\b(do not use|don'?t use|not for|avoid using|instead use|use .+ instead)\b/i.test(
        s,
      ),
    weight: 30,
  },
  {
    id: 'params',
    label: 'Required inputs mentioned',
    hint: 'Reference required parameters or context',
    test: (s) =>
      /\b(requires?|needs?|expects?|must (have|provide|pass|supply)|with a valid|provide (a|an|the)|pass (a|an|the))\b/i.test(
        s,
      ),
    weight: 20,
  },
]

function ScoreTag({ score }: { score: number }) {
  if (score >= 80)
    return (
      <span className="font-medium text-green-600 dark:text-green-400">
        Good
      </span>
    )
  if (score >= 50)
    return (
      <span className="font-medium text-yellow-600 dark:text-yellow-400">
        Needs work
      </span>
    )
  return (
    <span className="font-medium text-red-600 dark:text-red-400">
      Likely causing errors
    </span>
  )
}

export function ToolDescriptionGrader() {
  const [input, setInput] = useState('')

  const results = useMemo(() => {
    const trimmed = input.trim()
    if (!trimmed) return null
    const checks = CHECKS.map((c) => ({ ...c, passed: c.test(trimmed) }))
    const score = checks.reduce((sum, c) => sum + (c.passed ? c.weight : 0), 0)
    return { checks, score }
  }, [input])

  const barColor = results
    ? results.score >= 80
      ? 'bg-green-500'
      : results.score >= 50
        ? 'bg-yellow-500'
        : 'bg-red-500'
    : 'bg-neutral-300 dark:bg-neutral-600'

  return (
    <div className="not-prose my-8 rounded-xl border border-neutral-200 bg-neutral-50 p-5 dark:border-neutral-800 dark:bg-neutral-900/40">
      <p className="mb-0.5 text-sm font-semibold text-neutral-900 dark:text-white">
        Tool Description Grader
      </p>
      <p className="mb-4 text-xs text-neutral-500 dark:text-neutral-400">
        Paste a tool description to see what signal the model actually reads
      </p>
      <textarea
        className="w-full rounded-lg border border-neutral-200 bg-white p-3 font-mono text-xs text-neutral-900 placeholder-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder-neutral-600"
        rows={3}
        placeholder="Gets data for a user."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      {results && (
        <div className="mt-3 space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
              <div
                className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                style={{ width: `${results.score}%` }}
              />
            </div>
            <div className="w-36 text-right text-xs text-neutral-600 dark:text-neutral-400">
              {results.score}/100 &mdash; <ScoreTag score={results.score} />
            </div>
          </div>
          <ul className="space-y-1.5">
            {results.checks.map((c) => (
              <li key={c.id} className="flex items-start gap-2 text-xs">
                <span
                  className={`mt-px shrink-0 font-mono ${c.passed ? 'text-green-500' : 'text-neutral-300 dark:text-neutral-600'}`}
                >
                  {c.passed ? '✓' : '○'}
                </span>
                <span>
                  <span
                    className={
                      c.passed
                        ? 'text-neutral-700 dark:text-neutral-300'
                        : 'text-neutral-400 dark:text-neutral-600'
                    }
                  >
                    {c.label}
                  </span>
                  {!c.passed && (
                    <span className="ml-1 text-neutral-400 dark:text-neutral-500">
                      &mdash; {c.hint}
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
