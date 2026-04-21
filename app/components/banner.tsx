'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function Banner() {
  const pathname = usePathname()
  const pathSegments = pathname.split('/').filter(Boolean)
  const bannerText = pathSegments[0] || 'gopaljigaur'
  return (
    <span className="mb-16 inline-flex">
      <Link
        href={'/'}
        className="rounded-full focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:outline-none"
      >
        <div className="relative mr-4 w-12 self-center grayscale filter transition-all hover:grayscale-0">
          <Image
            alt="Gopalji Gaur"
            height={48}
            width={48}
            priority={true}
            src="https://www.gravatar.com/avatar/0d634a9edf65bcc4916888473f10b1e6?size=200"
            className="rounded-full bg-neutral-200 transition dark:bg-neutral-800 dark:brightness-90 dark:saturate-[0.85]"
          />
        </div>
      </Link>
      <Link
        href={'/' + bannerText}
        className="dark:text-dark-text text-light-text flex items-center"
      >
        <h1 className="relative ml-1 text-2xl font-semibold tracking-tight">
          <span className="mr-5">/</span>
          {bannerText}
        </h1>
      </Link>
    </span>
  )
}
