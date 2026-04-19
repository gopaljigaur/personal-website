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
      onClick={() => {
        navigator.vibrate?.(10)
        setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
      }}
      aria-label="Toggle dark mode"
      className="flex h-8 w-8 cursor-pointer items-center justify-center text-neutral-500 transition-colors hover:text-neutral-900 focus-visible:text-neutral-900 focus-visible:outline-none dark:text-neutral-400 dark:hover:text-neutral-100 dark:focus-visible:text-neutral-100"
    >
      {resolvedTheme === 'dark' ? <LuSun size={16} /> : <LuMoon size={16} />}
    </button>
  )
}

function SearchButton() {
  return (
    <button
      onClick={() => {
        navigator.vibrate?.(10)
        window.dispatchEvent(new Event('openCommandPalette'))
      }}
      aria-label="Open command palette"
      className="flex h-8 w-8 cursor-pointer items-center justify-center text-neutral-500 transition-colors hover:text-neutral-900 focus-visible:text-neutral-900 focus-visible:outline-none dark:text-neutral-400 dark:hover:text-neutral-100 dark:focus-visible:text-neutral-100"
    >
      <LuSearch size={16} />
    </button>
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
