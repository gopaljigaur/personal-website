import Link from 'next/link'
import { ArrowIcon } from 'app/components/footer'

export function StatusCard() {
  return (
    <div className="status-card flex flex-8 flex-col gap-6">
      <div className="status-item flex-1">
        <div className="status-item__title mb-1 inline-block bg-gradient-to-tr from-[var(--color-dark-primary)] to-[var(--color-dark-secondary)] bg-clip-text text-xl leading-normal font-semibold text-transparent">
          Current Role
        </div>
        <div className="status-item__value text-neutral-950 dark:text-neutral-100">
          Business Application Developer
        </div>
      </div>

      <div className="status-item flex-1">
        <div className="status-item__title mb-1 inline-block bg-gradient-to-tr from-[var(--color-dark-accent)] to-[var(--color-dark-primary)] bg-clip-text text-xl leading-normal font-semibold text-transparent">
          Workplace
        </div>
        <div className="status-item__value text-neutral-950 dark:text-neutral-100">
          <Link
            href={'https://www.everest-systems.com/'}
            className=""
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="mr-2">Everest Systems</span>
            <ArrowIcon />
          </Link>
        </div>
      </div>
    </div>
  )
}
