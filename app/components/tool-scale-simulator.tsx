'use client'
import React, { useState } from 'react'

const ZONES = [
  {
    max: 5,
    label: 'Safe zone',
    color: 'green' as const,
    desc: 'Reliable selection. Model can distinguish all tools. Focus on description quality, not architecture.',
  },
  {
    max: 12,
    label: 'Caution',
    color: 'yellow' as const,
    desc: 'Occasional wrong selection for semantically similar tools. Audit descriptions and add anti-patterns.',
  },
  {
    max: 20,
    label: 'Danger zone',
    color: 'orange' as const,
    desc: 'Consistent confusion between overlapping tools. Phantom function calls appear. A retrieval layer is overdue.',
  },
  {
    max: Infinity,
    label: 'Overloaded',
    color: 'red' as const,
    desc: 'Flat-list injection is unsafe at this scale. registry.query(context, top_k=8) is required.',
  },
]

type Color = (typeof ZONES)[number]['color']

const colorMap: Record<
  Color,
  { bar: string; text: string; bg: string; border: string }
> = {
  green: {
    bar: 'bg-green-500',
    text: 'text-green-700 dark:text-green-400',
    bg: 'bg-green-50 dark:bg-green-950/40',
    border: 'border-green-200 dark:border-green-900',
  },
  yellow: {
    bar: 'bg-yellow-500',
    text: 'text-yellow-700 dark:text-yellow-400',
    bg: 'bg-yellow-50 dark:bg-yellow-950/40',
    border: 'border-yellow-200 dark:border-yellow-900',
  },
  orange: {
    bar: 'bg-orange-500',
    text: 'text-orange-700 dark:text-orange-400',
    bg: 'bg-orange-50 dark:bg-orange-950/40',
    border: 'border-orange-200 dark:border-orange-900',
  },
  red: {
    bar: 'bg-red-500',
    text: 'text-red-700 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-950/40',
    border: 'border-red-200 dark:border-red-900',
  },
}

function getAccuracy(n: number): number {
  if (n <= 5) return 97
  if (n <= 12) return Math.round(97 - (n - 5) * 4.5)
  if (n <= 20) return Math.round(65 - (n - 12) * 2.5)
  return Math.max(18, Math.round(45 - (n - 20) * 1.3))
}

export function ToolScaleSimulator() {
  const [count, setCount] = useState(8)

  const zone = ZONES.find((z) => count <= z.max)!
  const accuracy = getAccuracy(count)
  const c = colorMap[zone.color]

  return (
    <div className="not-prose my-8 rounded-xl border border-neutral-200 bg-neutral-50 p-5 dark:border-neutral-800 dark:bg-neutral-900/40">
      <p className="mb-0.5 text-sm font-semibold text-neutral-900 dark:text-white">
        Tool Count Simulator
      </p>
      <p className="mb-4 text-xs text-neutral-500 dark:text-neutral-400">
        Drag to change registry size and see estimated selection accuracy
      </p>

      <div className="mb-4 flex items-center gap-4">
        <input
          type="range"
          min={1}
          max={40}
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
          className="flex-1 accent-neutral-700 dark:accent-neutral-300"
        />
        <span className="w-16 text-right text-2xl font-bold text-neutral-900 tabular-nums dark:text-white">
          {count}
        </span>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2">
        <div className="rounded-lg border border-neutral-200 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-950">
          <p className="mb-1 text-xs text-neutral-500 dark:text-neutral-400">
            Est. selection accuracy
          </p>
          <p className="text-xl font-bold text-neutral-900 dark:text-white">
            {accuracy}%
          </p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
            <div
              className="h-full rounded-full bg-blue-500 transition-all duration-500"
              style={{ width: `${accuracy}%` }}
            />
          </div>
        </div>
        <div className={`rounded-lg border p-3 ${c.bg} ${c.border}`}>
          <p className="mb-1 text-xs text-neutral-500 dark:text-neutral-400">
            Status
          </p>
          <p className={`text-xl font-bold ${c.text}`}>{zone.label}</p>
        </div>
      </div>

      <div
        className={`rounded-lg border p-3 text-xs ${c.bg} ${c.border} ${c.text}`}
      >
        {zone.desc}
      </div>
    </div>
  )
}
