'use client'

import { useTina } from 'tinacms/dist/react'
import { MiscLinksList } from './misc-list'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function MiscClient({
  query,
  variables,
  data,
}: {
  query: string
  variables: Record<string, unknown>
  data: any
}) {
  const { data: tinaData } = useTina({ query, variables, data })
  return <MiscLinksList links={tinaData.misc.links ?? []} />
}
