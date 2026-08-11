'use client'

import { useState } from 'react'

const GRID = 4
const SUBJECT_CELLS = new Set([5, 6, 9, 10])

const SCENES = [
  { label: 'Scene A', hue: 'emerald' },
  { label: 'Scene B', hue: 'amber' },
  { label: 'Scene C', hue: 'rose' },
] as const

const SCENE_BG: Record<string, string> = {
  emerald: 'bg-emerald-100 dark:bg-emerald-900/40',
  amber: 'bg-amber-100 dark:bg-amber-900/40',
  rose: 'bg-rose-100 dark:bg-rose-900/40',
}

const SCENE_SUBJECT: Record<string, string> = {
  emerald: 'bg-emerald-400 dark:bg-emerald-500',
  amber: 'bg-amber-400 dark:bg-amber-500',
  rose: 'bg-rose-400 dark:bg-rose-500',
}

export function AttentionShareDemo() {
  const [shared, setShared] = useState(false)

  return (
    <div className="not-prose my-8">
      <div className="grid grid-cols-3 gap-3">
        {SCENES.map((scene) => (
          <div key={scene.label} className="flex flex-col items-center">
            <div
              className="grid gap-0.5 rounded-md border border-neutral-200 p-1 dark:border-neutral-800"
              style={{ gridTemplateColumns: `repeat(${GRID}, 1fr)` }}
            >
              {Array.from({ length: GRID * GRID }).map((_, i) => {
                const isSubject = SUBJECT_CELLS.has(i)
                const cls =
                  isSubject && shared
                    ? 'bg-indigo-500 shadow-[0_0_6px_rgba(99,102,241,0.7)]'
                    : isSubject
                      ? SCENE_SUBJECT[scene.hue]
                      : SCENE_BG[scene.hue]
                return (
                  <div
                    key={i}
                    className={`h-4 w-4 rounded-[2px] transition-colors duration-300 ${cls}`}
                  />
                )
              })}
            </div>
            <span className="mt-2 text-xs text-neutral-500 dark:text-neutral-500">
              {scene.label}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-col items-center gap-2">
        <button
          onClick={() => setShared((v) => !v)}
          className="cursor-pointer rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-all hover:opacity-90 dark:bg-neutral-100 dark:text-black"
        >
          {shared ? 'Turn off attention sharing' : 'Turn on attention sharing'}
        </button>
        <p className="max-w-md text-center text-xs text-neutral-500 dark:text-neutral-500">
          {shared
            ? 'The masked patches (the subject) now attend to each other across all three images — same color, same identity — while every scene keeps its own background.'
            : 'Each image generates its subject independently, so it blends into whatever scene it landed in. Same prompt, three different characters.'}
        </p>
      </div>
    </div>
  )
}
