export function LabeledCode({
  type = 'note',
  label,
}: {
  type?: 'good' | 'bad' | 'note'
  label: string
}) {
  const config = {
    good: {
      className:
        'border-green-500/40 bg-green-500/5 text-green-600 dark:text-green-400',
      icon: '✓',
    },
    bad: {
      className:
        'border-red-500/40 bg-red-500/5 text-red-600 dark:text-red-400',
      icon: '✗',
    },
    note: {
      className:
        'border-blue-500/40 bg-blue-500/5 text-blue-600 dark:text-blue-400',
      icon: '→',
    },
  }

  const { className, icon } = config[type]

  return (
    <div
      className={`mt-6 mb-1 flex items-center gap-2 rounded border px-3 py-1.5 text-xs font-medium ${className}`}
    >
      <span aria-hidden="true">{icon}</span>
      <span>{label}</span>
    </div>
  )
}
