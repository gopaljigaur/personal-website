import { MainBanner } from 'app/components/banner'
import { profile } from 'app/lib/profile'
import HomeClient from './home-client'
import { client } from '../tina/__generated__/client'

export default async function Page() {
  if (process.env.NODE_ENV === 'development') {
    try {
      const tinaData = await client.queries.profile({
        relativePath: 'profile.json',
      })
      return (
        <HomeClient
          query={tinaData.query}
          variables={tinaData.variables}
          data={tinaData.data}
        />
      )
    } catch {
      // TinaCMS server not running — fall through to static rendering
    }
  }

  return (
    <section>
      <MainBanner
        name={profile.name}
        title={profile.title}
        location={profile.location}
      />
      <p className="mb-4">{profile.bio}</p>
    </section>
  )
}
