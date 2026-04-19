'use client'

import { useTina } from 'tinacms/dist/react'
import { MainBanner } from 'app/components/banner'

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
    </section>
  )
}
