'use client'

import Link from 'next/link'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { LuSun, LuMoon, LuSearch } from 'react-icons/lu'

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
      {resolvedTheme === 'dark' ? <LuSun size={16} /> : <LuMoon size={16} />}
    </button>
  )
}

function SearchButton() {
  const onClick = () => window.dispatchEvent(new Event('openCommandPalette'))
  return (
    <>
      {/* Mobile: icon only */}
      <button
        onClick={onClick}
        aria-label="Open command palette"
        className="navrow:hidden flex h-8 w-8 cursor-pointer items-center justify-center text-neutral-500 transition-colors hover:text-neutral-900 focus-visible:text-neutral-900 focus-visible:outline-none dark:text-neutral-400 dark:hover:text-neutral-100 dark:focus-visible:text-neutral-100"
      >
        <LuSearch size={16} />
      </button>
      {/* navrow+: fake search bar */}
      <button
        onClick={onClick}
        aria-label="Open command palette"
        className="navrow:flex hidden cursor-pointer items-center gap-2 rounded-md border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-xs text-neutral-400 transition-colors hover:border-neutral-300 hover:text-neutral-600 focus-visible:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:hover:border-neutral-600 dark:hover:text-neutral-300"
      >
        <LuSearch size={12} />
        <span>Search</span>
        <kbd className="rounded bg-neutral-100 px-1 py-0.5 text-[10px] font-medium text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500">
          ⌘K
        </kbd>
      </button>
    </>
  )
}

export function Navbar() {
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
          <div className="navrow:order-3 navrow:ml-0 navrow:gap-1 order-1 ml-2 flex items-center gap-3 sm:gap-2">
            <SearchButton />
            <ThemeToggle />
          </div>
        </nav>
      </div>
    </aside>
  )
}
