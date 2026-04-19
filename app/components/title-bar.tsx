'use client'

import { LuX, LuMinus, LuPlus, LuCopy, LuSquare } from 'react-icons/lu'

export function TitleBar({
  onClose,
  onMinimize,
  onExpand,
  expanded = false,
  title,
  className = '',
}: {
  onClose?: () => void
  onMinimize?: () => void
  onExpand?: () => void
  expanded?: boolean
  title?: string
  className?: string
}) {
  const isApple =
    typeof navigator !== 'undefined' &&
    (/mac|iphone|ipad|ipod/i.test(navigator.userAgent) ||
      (/Mac/i.test(navigator.platform) && navigator.maxTouchPoints > 0))

  if (isApple) {
    return (
      <div className="group inline-flex items-center gap-2.5 px-3 py-2">
        <button
          onClick={onClose}
          disabled={!onClose}
          aria-label="Close"
          className={`flex h-3.5 w-3.5 items-center justify-center rounded-full transition-opacity ${onClose ? 'cursor-pointer bg-[#ff5f57] hover:opacity-80' : 'cursor-not-allowed bg-[#ff5f57]/40'}`}
        >
          <LuX
            size={8}
            strokeWidth={4}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`block text-[#820005] ${onClose ? 'opacity-0 group-hover:opacity-100' : 'opacity-0'}`}
          />
        </button>
        <button
          onClick={onMinimize}
          disabled={!onMinimize}
          aria-label="Minimize"
          className={`flex h-3.5 w-3.5 items-center justify-center rounded-full transition-opacity ${onMinimize ? 'cursor-pointer bg-[#febc2e] hover:opacity-80' : 'cursor-not-allowed bg-[#febc2e]/40'}`}
        >
          <LuMinus
            size={8}
            strokeWidth={4}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`block text-[#7d5000] ${onMinimize ? 'opacity-0 group-hover:opacity-100' : 'opacity-0'}`}
          />
        </button>
        <button
          onClick={onExpand}
          disabled={!onExpand}
          aria-label="Expand"
          className={`flex h-3.5 w-3.5 items-center justify-center rounded-full transition-opacity ${onExpand ? 'cursor-pointer bg-[#28c840] hover:opacity-80' : 'cursor-not-allowed bg-[#28c840]/40'}`}
        >
          <LuPlus
            size={8}
            strokeWidth={4}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`block text-[#006413] ${onExpand ? 'opacity-0 group-hover:opacity-100' : 'opacity-0'}`}
          />
        </button>
        {title && (
          <span className="text-secondary-inv ml-2 text-xs font-medium">
            {title}
          </span>
        )}
      </div>
    )
  }

  return (
    <div className={`flex h-9 w-full items-stretch ${className}`}>
      {title && (
        <span className="text-secondary-inv flex flex-1 items-center pl-3 text-xs font-medium">
          {title}
        </span>
      )}
      <div className="ml-auto flex items-stretch">
        <button
          onClick={onMinimize}
          disabled={!onMinimize}
          aria-label="Minimize"
          className="flex w-11 cursor-pointer items-center justify-center text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-neutral-700 dark:hover:text-neutral-200"
        >
          <LuMinus size={14} />
        </button>
        <button
          onClick={onExpand}
          disabled={!onExpand}
          aria-label="Expand"
          className="flex w-11 cursor-pointer items-center justify-center text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-neutral-700 dark:hover:text-neutral-200"
        >
          {expanded ? <LuCopy size={12} /> : <LuSquare size={12} />}
        </button>
        <button
          onClick={onClose}
          disabled={!onClose}
          aria-label="Close"
          className="flex w-11 cursor-pointer items-center justify-center text-neutral-400 transition-colors hover:bg-[#c42b1c] hover:text-white focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40"
        >
          <LuX size={14} />
        </button>
      </div>
    </div>
  )
}
