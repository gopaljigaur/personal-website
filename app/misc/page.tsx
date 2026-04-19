import type { Metadata } from 'next'
import { miscLinks } from './data'
import { MiscLinksList } from './misc-list'
import MiscClient from './misc-client'

export const metadata: Metadata = { title: 'Miscellaneous' }

export default async function Page() {
  if (process.env.NODE_ENV === 'development') {
    try {
      const { client } = await import('../../tina/__generated__/client')
      const tinaData = await client.queries.misc({ relativePath: 'misc.json' })
      return (
        <MiscClient
          query={tinaData.query}
          variables={tinaData.variables}
          data={tinaData.data}
        />
      )
    } catch {
      // TinaCMS server not running — fall through to static rendering
    }
  }

  return <MiscLinksList links={miscLinks} />
}
