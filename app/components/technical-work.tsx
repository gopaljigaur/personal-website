import Link from 'next/link'

export function TechnicalWork() {
  return (
    <section className="my-12" aria-labelledby="technical-work">
      <h2
        id="technical-work"
        className="mb-5 text-xl font-semibold tracking-tight"
      >
        Technical investigations
      </h2>
      <div className="rounded-xl border border-neutral-200 p-6 dark:border-neutral-800">
        <p className="mb-3 text-xs tracking-widest text-neutral-500 uppercase dark:text-neutral-400">
          Preview draft · PyTorch · Attention
        </p>
        <h3 className="mb-3 text-xl leading-snug font-medium">
          <Link
            href="/notes/attention"
            className="underline decoration-neutral-300 underline-offset-4 hover:decoration-current"
          >
            Smaller attention matrices do not necessarily mean less training
            memory
          </Link>
        </h3>
        <p className="mb-4 text-neutral-600 dark:text-neutral-400">
          An implementation, gradient checks and a CPU experiment on what
          autograd retains when attention is split into query chunks.
        </p>
        <p className="mb-5 text-sm text-neutral-600 dark:text-neutral-400">
          64 output-and-gradient comparisons passed. Includes code, raw
          measurements and the limits of the experiment.
        </p>
        <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm">
          <Link
            href="/notes/attention"
            className="underline underline-offset-4"
          >
            Read the investigation
          </Link>
          <a
            href="/experiments/attention/attention.py"
            className="underline underline-offset-4"
          >
            Inspect the code
          </a>
        </div>
      </div>
    </section>
  )
}
