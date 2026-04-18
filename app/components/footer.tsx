export function ArrowIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="inline-block"
    >
      <path
        d="M2.07102 11.3494L0.963068 10.2415L9.2017 1.98864H2.83807L2.85227 0.454545H11.8438V9.46023H10.2955L10.3097 3.09659L2.07102 11.3494Z"
        fill="currentColor"
      />
    </svg>
  )
}

export default function Footer() {
  return (
    <footer className="pb-12">
      <div className="font-sm mt-8 flex items-center text-neutral-600 dark:text-neutral-400">
        <ul className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-x-4">
          <li>
            <a
              className="flex items-center transition-all hover:text-neutral-800 focus-visible:text-neutral-800 focus-visible:outline-none dark:hover:text-neutral-100 dark:focus-visible:text-neutral-100"
              rel="noopener noreferrer"
              target="_blank"
              href="https://github.com/gopaljigaur"
            >
              <ArrowIcon />
              <span className="ml-2">github</span>
            </a>
          </li>
          <li>
            <a
              className="flex items-center transition-all hover:text-neutral-800 focus-visible:text-neutral-800 focus-visible:outline-none dark:hover:text-neutral-100 dark:focus-visible:text-neutral-100"
              rel="noopener noreferrer"
              target="_blank"
              href="https://www.linkedin.com/in/gopaljigaur/"
            >
              <ArrowIcon />
              <span className="ml-2">linkedin</span>
            </a>
          </li>
          <li>
            <a
              className="flex items-center transition-all hover:text-neutral-800 focus-visible:text-neutral-800 focus-visible:outline-none dark:hover:text-neutral-100 dark:focus-visible:text-neutral-100"
              href="mailto:contact@gopalji.me"
            >
              <ArrowIcon />
              <span className="ml-2">email</span>
            </a>
          </li>
          <li>
            <a
              className="flex items-center transition-all hover:text-neutral-800 focus-visible:text-neutral-800 focus-visible:outline-none dark:hover:text-neutral-100 dark:focus-visible:text-neutral-100"
              href="/cv/ml"
              target="_blank"
              rel="noopener noreferrer"
            >
              <ArrowIcon />
              <span className="ml-2">resume</span>
            </a>
          </li>
        </ul>
      </div>
    </footer>
  )
}
