import Link from 'next/link'
import { ArrowIcon } from 'app/components/footer'

export function StatusCard() {
  return (
    <div className="status-card flex flex-none flex-col gap-6 pr-2">
      <div className="status-item flex-1">
        <div className="status-item__title from-dark-primary to-dark-secondary mb-1 inline-block bg-gradient-to-tr bg-clip-text text-xl leading-normal font-semibold text-transparent">
          Current Role
        </div>
        <div className="status-item__value text-neutral-950 dark:text-neutral-100">
          AI Application Developer
        </div>
      </div>

      <div className="status-item flex-1">
        <div className="status-item__title from-dark-accent to-dark-primary mb-1 inline-block bg-gradient-to-tr bg-clip-text text-xl leading-normal font-semibold text-transparent">
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
