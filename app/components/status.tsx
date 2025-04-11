import Link from "next/link";
import { ArrowIcon } from 'app/components/footer'

export function StatusCard() {
    return (
        <div className="status-card flex flex-col gap-6 flex-8">
            <div className="status-item flex-1">
                <div className="status-item__title text-xl font-semibold mb-1 bg-gradient-to-tr from-[var(--color-dark-primary)] to-[var(--color-dark-secondary)] inline-block text-transparent bg-clip-text leading-normal">
                    Current Role
                </div>
                <div className="status-item__value dark:text-neutral-100 text-neutral-950">
                    Business Application Developer
                </div>
            </div>

            <div className="status-item flex-1">
                <div className="status-item__title text-xl font-semibold mb-1 bg-gradient-to-tr from-[var(--color-dark-accent)] to-[var(--color-dark-primary)] inline-block text-transparent bg-clip-text leading-normal">
                    Workplace
                </div>
                <div className="status-item__value dark:text-neutral-100 text-neutral-950">
                    <Link
                        href={'https://www.everest-systems.com/'}
                        className=""
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <span className="mr-2">
                            Everest Systems
                        </span>
                    <ArrowIcon />
                    </Link>
                </div>
            </div>
        </div>
    );
}