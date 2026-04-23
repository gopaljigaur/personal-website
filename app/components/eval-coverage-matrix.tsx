'use client'
import React from 'react'

const FAILURE_MODES = [
  'Verbosity bias',
  'Position bias',
  'Self-preference bias',
  'Factual regression',
  'Format / schema breakage',
  'Metric drift from user outcomes',
]

const METHODS = [
  {
    name: 'Deterministic checks',
    short: 'Det.',
    covers: [false, false, false, false, true, false],
  },
  {
    name: 'Reference-based metrics',
    short: 'Ref.',
    covers: [false, false, false, true, true, false],
  },
  {
    name: 'Same-provider judge',
    short: 'Same',
    covers: [false, false, false, false, false, false],
  },
  {
    name: 'Cross-provider judge',
    short: 'Cross',
    covers: [true, false, true, false, false, false],
  },
  {
    name: 'Human eval set',
    short: 'Human',
    covers: [true, true, true, true, true, true],
  },
]

export function EvalCoverageMatrix() {
  return (
    <div className="not-prose my-8 overflow-x-auto rounded-xl border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900/40">
      <div className="p-5 pb-3">
        <p className="mb-0.5 text-sm font-semibold text-neutral-900 dark:text-white">
          Eval Method Coverage
        </p>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Which failure modes each evaluation approach can actually catch
        </p>
      </div>
      <table className="w-full text-xs">
        <thead>
          <tr className="border-t border-neutral-200 dark:border-neutral-800">
            <th className="px-5 py-2.5 text-left font-medium text-neutral-500 dark:text-neutral-400">
              Failure mode
            </th>
            {METHODS.map((m) => (
              <th
                key={m.name}
                className="px-3 py-2.5 text-center font-medium text-neutral-500 dark:text-neutral-400"
                title={m.name}
              >
                {m.short}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {FAILURE_MODES.map((mode, i) => (
            <tr
              key={mode}
              className="border-t border-neutral-100 dark:border-neutral-800/50"
            >
              <td className="px-5 py-2 text-neutral-700 dark:text-neutral-300">
                {mode}
              </td>
              {METHODS.map((m) => (
                <td key={m.name} className="px-3 py-2 text-center">
                  {m.covers[i] ? (
                    <span className="text-green-500">✓</span>
                  ) : m.name === 'Same-provider judge' ? (
                    <span className="text-red-400 dark:text-red-500">✗</span>
                  ) : (
                    <span className="text-neutral-200 dark:text-neutral-700">
                      ○
                    </span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex flex-wrap gap-4 border-t border-neutral-100 px-5 py-3 dark:border-neutral-800">
        {METHODS.map((m) => (
          <span
            key={m.name}
            className="text-xs text-neutral-400 dark:text-neutral-600"
          >
            <span className="font-medium text-neutral-700 dark:text-neutral-300">
              {m.short}
            </span>{' '}
            = {m.name}
          </span>
        ))}
      </div>
    </div>
  )
}
