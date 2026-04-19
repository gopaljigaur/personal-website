'use client'

import Image from 'next/image'
import Link from 'next/link'
import { StatusCard } from './status'
import { usePathname } from 'next/navigation'
import profileData from 'content/profile.json'

export function MainBanner({
  name = profileData.name,
  title = profileData.title,
  location = profileData.location,
}: {
  name?: string
  title?: string
  location?: string
} = {}) {
  return (
    <span className="dark:text-dark-text text-light-text smplus:flex-row smplus:justify-between mb-14 flex flex-col gap-6">
      <div className="smplus:mb-0 mb-4 flex-none flex-row">
        <Link
          href={'https://gopalji.me'}
          className="inline-flex flex-row gap-6"
        >
          <div className="relative w-12 min-w-12">
            <Image
              alt={name}
              height={48}
              width={48}
              priority={true}
              src="https://www.gravatar.com/avatar/0d634a9edf65bcc4916888473f10b1e6?size=200"
              className="rounded-full bg-neutral-200 transition dark:bg-neutral-800 dark:brightness-90 dark:saturate-[0.85]"
            />
          </div>
          <h1 className="relative mt-1 text-4xl font-semibold tracking-tight">
            {name}
          </h1>
        </Link>
        <h2 className="mt-6 text-2xl tracking-tight">
          <p className="from-dark-secondary to-dark-primary inline-block bg-gradient-to-tr bg-clip-text leading-normal font-semibold text-transparent">
            {title}
          </p>
          <br></br>
          based in {location}.
        </h2>
      </div>
      {/*<div className="flex-1 content-center min-w-[128px] justify-items-start sm:justify-items-end mb-4 sm:mb-0">*/}
      {/*    <Image*/}
      {/*        alt='Gopalji Gaur'*/}
      {/*        height={128}*/}
      {/*        width={128}*/}
      {/*        priority={true}*/}
      {/*        src='https://www.gravatar.com/avatar/0d634a9edf65bcc4916888473f10b1e6?size=200'*/}
      {/*        className="rounded-full bg-neutral-200 dark:bg-neutral-800 dark:brightness-90 dark:saturate-[0.85] transition"*/}
      {/*    />*/}
      {/*</div>*/}
      <StatusCard />
    </span>
  )
}

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
