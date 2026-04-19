export function Callout({
  children,
  content,
  type = 'note',
}: {
  children?: React.ReactNode
  content?: string
  type?: 'note' | 'warning' | 'tip'
}) {
  const config = {
    note: {
      styles: 'border-l-2 border-blue-500/50 bg-blue-500/5',
    },
    tip: {
      styles: 'border-l-2 border-green-500/50 bg-green-500/5',
    },
    warning: {
      styles: 'border-l-2 border-yellow-500/50 bg-yellow-500/5',
    },
  }

  const { styles } = config[type]

  return (
    <div
      className={`my-4 rounded px-4 py-3 text-sm text-neutral-400 ${styles}`}
    >
      {content ?? children}
    </div>
  )
}
