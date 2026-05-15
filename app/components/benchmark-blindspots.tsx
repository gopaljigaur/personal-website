'use client'
import React from 'react'

const SCENARIOS = [
  {
    scenario: 'Single subject, clean reference images',
    note: 'The standard benchmark setup',
    dinoI: true,
    clipT: true,
    dreamBench: true,
    realWorld: false,
  },
  {
    scenario: 'Multi-subject scene (3+ characters)',
    note: 'Common production use case',
    dinoI: false,
    clipT: false,
    dreamBench: false,
    realWorld: true,
  },
  {
    scenario: 'Subject in complex or novel background',
    note: '',
    dinoI: false,
    clipT: true,
    dreamBench: true,
    realWorld: true,
  },
  {
    scenario: 'Consistent character across a sequence',
    note: 'Story, comic strip, product shoot',
    dinoI: false,
    clipT: false,
    dreamBench: false,
    realWorld: true,
  },
  {
    scenario: 'Zero-shot generation (no fine-tuning)',
    note: 'Hard constraint in many production pipelines',
    dinoI: false,
    clipT: false,
    dreamBench: false,
    realWorld: true,
  },
  {
    scenario: 'Generated images as reference inputs',
    note: 'Reference is itself slightly inconsistent',
    dinoI: false,
    clipT: false,
    dreamBench: false,
    realWorld: true,
  },
]

function Cell({
  covered,
  productionCritical,
}: {
  covered: boolean
  productionCritical: boolean
}) {
  if (covered)
    return <span className="text-green-500 dark:text-green-400">✓</span>
  if (productionCritical)
    return <span className="font-bold text-red-500 dark:text-red-400">✗</span>
  return <span className="text-neutral-200 dark:text-neutral-700">○</span>
}

export function BenchmarkBlindspots() {
  return (
    <div className="not-prose my-8 overflow-x-auto rounded-xl border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900/40">
      <div className="p-5 pb-3">
        <p className="mb-0.5 text-sm font-semibold text-neutral-900 dark:text-white">
          Benchmark Coverage vs Real Scenarios
        </p>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Standard benchmarks cover the easy cases. Production breaks on the
          rest.
        </p>
      </div>
      <table className="w-full text-xs">
        <thead>
          <tr className="border-t border-neutral-200 dark:border-neutral-800">
            <th className="px-5 py-2.5 text-left font-medium text-neutral-500 dark:text-neutral-400">
              Scenario
            </th>
            <th className="px-3 py-2.5 text-center font-medium text-neutral-500 dark:text-neutral-400">
              DINO-I
            </th>
            <th className="px-3 py-2.5 text-center font-medium text-neutral-500 dark:text-neutral-400">
              CLIP-T
            </th>
            <th className="px-3 py-2.5 text-center font-medium text-neutral-500 dark:text-neutral-400">
              DreamBench
            </th>
          </tr>
        </thead>
        <tbody>
          {SCENARIOS.map((s) => (
            <tr
              key={s.scenario}
              className="border-t border-neutral-100 dark:border-neutral-800/50"
            >
              <td className="px-5 py-2">
                <span className="text-neutral-700 dark:text-neutral-300">
                  {s.scenario}
                </span>
                {s.note && (
                  <span className="ml-1.5 text-neutral-400 dark:text-neutral-600">
                    ({s.note})
                  </span>
                )}
              </td>
              <td className="px-3 py-2 text-center">
                <Cell covered={s.dinoI} productionCritical={s.realWorld} />
              </td>
              <td className="px-3 py-2 text-center">
                <Cell covered={s.clipT} productionCritical={s.realWorld} />
              </td>
              <td className="px-3 py-2 text-center">
                <Cell covered={s.dreamBench} productionCritical={s.realWorld} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="border-t border-neutral-100 px-5 py-3 text-xs text-neutral-400 dark:border-neutral-800 dark:text-neutral-600">
        ✓ evaluated &nbsp;&nbsp; ✗ missing (production-critical) &nbsp;&nbsp; ○
        not applicable
      </p>
    </div>
  )
}
