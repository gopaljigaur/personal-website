'use client'

import { useTina } from 'tinacms/dist/react'
import { MainBanner } from 'app/components/banner'
import { NewsletterForm } from 'app/components/newsletter-form'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function HomeClient({
  query,
  variables,
  data,
}: {
  query: string
  variables: Record<string, unknown>
  data: any
}) {
  const { data: tinaData } = useTina({ query, variables, data })
  const p = tinaData.profile

  return (
    <section>
      <MainBanner name={p.name} title={p.title} location={p.location} />
      <p className="mb-4">{p.bio}</p>
      <div className="mt-8 border-t border-neutral-200 pt-8 dark:border-neutral-800">
        <p className="mb-1 text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Stay in the loop
        </p>
        <p className="mb-4 text-sm text-neutral-500 dark:text-neutral-400">
          Get notified when I publish new posts or projects.
        </p>
        <NewsletterForm />
      </div>
    </section>
  )
}
