'use client'

import Link from 'next/link'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { ChatButton } from './chat-widget'

const navItems = {
  '/': { name: 'home' },
  '/blog': { name: 'blog' },
  '/projects': { name: 'projects' },
  '/misc': { name: 'misc' },
}

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) return <div className="h-8 w-8" />

  return (
    <button
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      aria-label="Toggle dark mode"
      className="flex h-8 w-8 cursor-pointer items-center justify-center text-neutral-500 transition-colors hover:text-neutral-900 focus-visible:text-neutral-900 focus-visible:outline-none dark:text-neutral-400 dark:hover:text-neutral-100 dark:focus-visible:text-neutral-100"
    >
      {resolvedTheme === 'dark' ? (
        // Sun icon
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      ) : (
        // Moon icon
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  )
}

function SearchButton() {
  return (
    <button
      onClick={() => window.dispatchEvent(new Event('openCommandPalette'))}
      aria-label="Open command palette"
      className="flex cursor-pointer items-center text-neutral-500 transition-colors hover:text-neutral-900 focus-visible:text-neutral-900 focus-visible:outline-none dark:text-neutral-400 dark:hover:text-neutral-100 dark:focus-visible:text-neutral-100"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
    </button>
  )
}

export function Navbar({ chatEnabled }: { chatEnabled?: boolean }) {
  return (
    <aside className="mb-16 -ml-[8px] tracking-tight">
      <div className="lg:sticky lg:top-20">
        <nav
          className="fade navrow:flex-row navrow:items-center relative flex flex-col items-start px-0 pb-0"
          id="nav"
        >
          <div className="navrow:order-1 order-2 flex flex-row space-x-0">
            {Object.entries(navItems).map(([path, { name }]) => (
              <Link
                key={path}
                href={path}
                className="relative m-1 flex px-2 py-1 align-middle transition-all hover:text-neutral-800 dark:hover:text-neutral-200"
              >
                {name}
              </Link>
            ))}
          </div>
          <div className="navrow:order-2 navrow:block navrow:min-w-4 navrow:flex-1 order-3 hidden" />
          <div className="navrow:order-3 navrow:ml-0 navrow:gap-2 order-1 ml-2 flex items-center gap-4 sm:gap-3">
            {chatEnabled && <ChatButton />}
            <SearchButton />
            <ThemeToggle />
          </div>
        </nav>
      </div>
    </aside>
  )
}
