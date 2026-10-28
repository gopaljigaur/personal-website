import { MainBanner } from 'app/components/banner'
import { profile } from 'app/lib/profile'
import { NewsletterSection } from 'app/components/newsletter-section'
import HomeClient from './home-client'
export default async function Page() {
  if (process.env.NODE_ENV === 'development') {
    try {
      // @ts-ignore
      const { client } = await import('../tina/__generated__/client')
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
      <NewsletterSection />
    </section>
  )
}
