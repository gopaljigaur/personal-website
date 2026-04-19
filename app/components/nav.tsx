'use client'

import Link from 'next/link'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { LuSun, LuMoon, LuSearch, LuSparkles } from 'react-icons/lu'
import { Shortcut } from 'app/components/shortcut'

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

  if (!mounted) return <div className="h-[30px] w-[3.25rem]" />

  const isDark = resolvedTheme === 'dark'

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label="Toggle dark mode"
      className="flex cursor-pointer items-center gap-0.5 rounded-md border border-neutral-300 bg-neutral-50 px-1 py-1 transition-colors hover:border-neutral-400 focus-visible:outline-none dark:border-neutral-600 dark:bg-neutral-900 dark:hover:border-neutral-500"
    >
      {(
        [
          { icon: <LuSun size={12} />, value: 'light' },
          { icon: <LuMoon size={12} />, value: 'dark' },
        ] as const
      ).map(({ icon, value }) => {
        const active = isDark ? value === 'dark' : value === 'light'
        return (
          <span
            key={value}
            className={`flex items-center justify-center rounded px-1.5 py-1 transition-colors ${
              active
                ? 'bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-neutral-100'
                : 'text-neutral-400 dark:text-neutral-300'
            }`}
          >
            {icon}
          </span>
        )
      })}
    </button>
  )
}

const MODES = [
  { label: 'Search', icon: 'search' },
  { label: 'Ask AI', icon: 'ai' },
] as const

function SearchButton() {
  const [modeIdx, setModeIdx] = useState(0)

  useEffect(() => {
    const id = setInterval(
      () => setModeIdx((i) => (i + 1) % MODES.length),
      5000,
    )
    return () => clearInterval(id)
  }, [])

  const onClick = () => window.dispatchEvent(new Event('openCommandPalette'))

  return (
    <button
      onClick={onClick}
      aria-label="Open command palette"
      className="flex cursor-pointer items-center gap-2 rounded-md border border-neutral-300 bg-neutral-50 px-2.5 py-1 text-xs text-neutral-500 transition-colors hover:border-neutral-400 hover:text-neutral-700 focus-visible:outline-none dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:border-neutral-500 dark:hover:text-neutral-200"
    >
      <span className="relative flex h-3 w-3 items-center justify-center">
        {MODES.map((m, i) => (
          <span
            key={m.label}
            className={`absolute transition-opacity duration-300 ${i === modeIdx ? 'opacity-100' : 'opacity-0'}`}
          >
            {m.icon === 'ai' ? (
              <LuSparkles size={12} />
            ) : (
              <LuSearch size={12} />
            )}
          </span>
        ))}
      </span>
      <span className="relative h-5 w-12">
        {MODES.map((m, i) => (
          <span
            key={m.label}
            className={`absolute inset-0 flex items-center transition-opacity duration-300 ${i === modeIdx ? 'opacity-100' : 'opacity-0'}`}
          >
            {m.label}
          </span>
        ))}
      </span>
      <span className="min-w-[2.5rem]">
        <Shortcut combo="K" />
      </span>
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
