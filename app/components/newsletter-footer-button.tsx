'use client'

import { usePathname, useRouter } from 'next/navigation'
import { ArrowIcon } from 'app/components/footer'

export function NewsletterFooterButton() {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <button
      onClick={() => {
        if (pathname === '/') {
          window.dispatchEvent(new Event('openNewsletter'))
        } else {
          sessionStorage.setItem('newsletter_highlight', '1')
          router.push('/')
        }
      }}
      className="flex cursor-pointer items-center transition-all hover:text-neutral-800 focus-visible:text-neutral-800 focus-visible:outline-none dark:hover:text-neutral-100 dark:focus-visible:text-neutral-100"
    >
      <ArrowIcon />
      <span className="ml-2">newsletter</span>
    </button>
  )
}
