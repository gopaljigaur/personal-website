import katex from 'katex'
import 'katex/dist/katex.min.css'

export function Equation({
  formula,
  caption,
}: {
  formula: string
  caption?: string
}) {
  const markup = katex.renderToString(formula, {
    displayMode: true,
    output: 'htmlAndMathml',
    throwOnError: true,
    trust: false,
  })
  return (
    <figure className="my-6 rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100">
      <div
        className="overflow-x-auto py-1"
        dangerouslySetInnerHTML={{ __html: markup }}
      />
      {caption && (
        <figcaption className="mt-2 text-center text-sm text-neutral-600 dark:text-neutral-400">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}
