'use client'
import React, { useState } from 'react'

const SHORT = {
  label: 'Concise answer',
  words: 6,
  text: 'Paris is the capital of France.',
  score: 5.1,
}

const VERBOSE = {
  label: 'Padded answer',
  words: 63,
  text: "That's a great question! Paris, which has been the capital of France since the late 10th century, is indeed the capital of France. It serves as the country's political, economic, and cultural center. The city, situated along the Seine river, has a rich history spanning over 2,000 years and is home to iconic landmarks. To summarize: Paris is the capital of France.",
  score: 8.2,
}

type State = 'idle' | 'judging' | 'done'

export function VerbosityBiasDemo() {
  const [flipped, setFlipped] = useState(false)
  const [state, setState] = useState<State>('idle')

  const a = flipped ? VERBOSE : SHORT
  const b = flipped ? SHORT : VERBOSE

  function runJudge() {
    setState('judging')
    setTimeout(() => setState('done'), 1400)
  }

  function swap() {
    setFlipped((f) => !f)
    setState('idle')
  }

  return (
    <div className="not-prose my-8 rounded-xl border border-neutral-200 bg-neutral-50 p-5 dark:border-neutral-800 dark:bg-neutral-900/40">
      <p className="mb-0.5 text-sm font-semibold text-neutral-900 dark:text-white">
        Verbosity + Position Bias Demo
      </p>
      <p className="mb-1 text-xs text-neutral-500 dark:text-neutral-400">
        Both responses are factually correct. Run the judge to see which wins.
      </p>
      <p className="mb-4 text-xs text-neutral-400 italic dark:text-neutral-600">
        Q: What is the capital of France?
      </p>

      <div className="mb-4 grid grid-cols-2 gap-3">
        {[a, b].map((ans, i) => (
          <div
            key={i}
            className="flex flex-col rounded-lg border border-neutral-200 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-950"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium text-neutral-500">
                Response {i === 0 ? 'A' : 'B'}
              </span>
              <span className="text-xs text-neutral-400">{ans.words}w</span>
            </div>
            <p className="flex-1 text-xs leading-relaxed text-neutral-700 dark:text-neutral-300">
              {ans.text}
            </p>
            {state === 'done' && (
              <div className="mt-3 border-t border-neutral-100 pt-3 dark:border-neutral-800">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs text-neutral-400">Judge score</span>
                  <span
                    className={`text-sm font-bold tabular-nums ${ans.score > 7 ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}
                  >
                    {ans.score}/10
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${ans.score > 7 ? 'bg-green-500' : 'bg-red-400'}`}
                    style={{ width: `${ans.score * 10}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <button
          onClick={runJudge}
          disabled={state === 'judging'}
          className="flex-1 rounded-lg bg-neutral-900 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-neutral-700 disabled:opacity-50 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          {state === 'judging'
            ? 'Judging…'
            : state === 'done'
              ? 'Re-run judge'
              : 'Run gpt-4o judge'}
        </button>
        <button
          onClick={swap}
          className="rounded-lg border border-neutral-200 px-3 py-2 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800"
        >
          Swap order
        </button>
      </div>

      {state === 'done' && (
        <p className="mt-3 text-xs text-neutral-500 dark:text-neutral-400">
          {flipped
            ? 'Verbose answer is now in position A and still wins. Longer always beats shorter. Earlier always beats later. Both biases confirmed.'
            : 'Verbose answer wins despite identical facts. Now swap the order — position B next.'}
        </p>
      )}
    </div>
  )
}
