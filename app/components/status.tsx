import Link from "next/link";
import { ArrowIcon } from 'app/components/footer'

export function StatusCard() {
    return (
        <div className="status-card mb-14 flex flex-col sm:flex-row gap-8 sm:gap-4">
            <div className="status-item flex-1">
                <div className="status-item__title font-semibold mb-2 bg-gradient-to-tr from-blue-600 via-green-500 to-indigo-400 inline-block text-transparent bg-clip-text leading-normal">
                    Current Role
                </div>
                <div className="status-item__value dark:text-neutral-100 text-neutral-950">
                    Machine Learning Engineer
                </div>
            </div>

            <div className="status-item flex-1">
                <div className="status-item__title font-semibold mb-2 bg-gradient-to-tr from-blue-600 via-green-500 to-indigo-400 inline-block text-transparent bg-clip-text leading-normal">
                    Workplace
                </div>
                <div className="status-item__value dark:text-neutral-100 text-neutral-950">
                    <Link
                        href={'https://ml.informatik.uni-freiburg.de/'}
                        className=""
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <span className="mr-2">
                            ML Lab @ University of Freiburg
                        </span>
                    <ArrowIcon />
                    </Link>
                </div>
            </div>
        </div>
    );
}