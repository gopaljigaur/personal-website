'use client'
import React, { useState } from 'react'

const METHODS = [
  {
    label: 'Full fine-tuning',
    sub: 'DreamBooth / LoRA per subject',
    setup: 'Minutes to hours per subject',
    fidelity: 95,
    composability: 15,
    flexibility: 5,
    desc: 'Highest DINO-I scores. Strong texture reproduction. Each new subject needs its own fine-tune. LoRA fusion breaks down at 3+ subjects.',
  },
  {
    label: 'Adapter-based',
    sub: 'IP-Adapter-Plus style',
    setup: 'Seconds at inference time',
    fidelity: 72,
    composability: 45,
    flexibility: 60,
    desc: 'Fast and flexible. Subject stays visually consistent at a glance. Complex prompt + subject compositions break. Text alignment degrades under load.',
  },
  {
    label: 'Training-free',
    sub: 'Masked cross-image attention',
    setup: 'Zero — reference images at inference',
    fidelity: 58,
    composability: 80,
    flexibility: 95,
    desc: 'Zero-shot, any subject count, zero setup cost. Lower DINO-I. Attention leakage appears at 3+ subjects without masking. Benchmarks penalize this; users in practice often prefer it.',
  },
]

const METRICS = [
  {
    key: 'fidelity',
    label: 'Texture fidelity (what DINO-I measures)',
    color: 'bg-blue-500',
  },
  {
    key: 'composability',
    label: 'Multi-subject composability',
    color: 'bg-purple-500',
  },
  { key: 'flexibility', label: 'Zero-shot flexibility', color: 'bg-green-500' },
] as const

export function ConsistencyTradeoffExplorer() {
  const [sel, setSel] = useState(0)
  const method = METHODS[sel]

  return (
    <div className="not-prose my-8 rounded-xl border border-neutral-200 bg-neutral-50 p-5 dark:border-neutral-800 dark:bg-neutral-900/40">
      <p className="mb-0.5 text-sm font-semibold text-neutral-900 dark:text-white">
        Consistency Method Tradeoffs
      </p>
      <p className="mb-4 text-xs text-neutral-500 dark:text-neutral-400">
        Each approach optimizes for a different axis. DINO-I only measures the
        first one.
      </p>

      <div className="mb-4 flex gap-1.5">
        {METHODS.map((m, i) => (
          <button
            key={m.label}
            onClick={() => setSel(i)}
            className={`flex-1 rounded-lg px-2 py-2 text-xs font-medium transition-colors ${
              sel === i
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                : 'border border-neutral-200 text-neutral-600 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="mb-4 rounded-lg border border-neutral-200 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-950">
        <p className="mb-0.5 text-xs font-medium text-neutral-700 dark:text-neutral-200">
          {method.sub}
        </p>
        <p className="mb-2 text-xs text-neutral-400 dark:text-neutral-500">
          Setup cost: {method.setup}
        </p>
        <p className="text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
          {method.desc}
        </p>
      </div>

      <div className="space-y-2.5">
        {METRICS.map((m) => (
          <div key={m.key}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="text-neutral-600 dark:text-neutral-400">
                {m.label}
              </span>
              <span className="text-neutral-500 tabular-nums dark:text-neutral-500">
                {method[m.key]}%
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
              <div
                className={`h-full rounded-full transition-all duration-500 ${m.color}`}
                style={{ width: `${method[m.key]}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
