import { MainBanner } from 'app/components/banner'
import { profile } from 'app/lib/profile'
import { NewsletterForm } from 'app/components/newsletter-form'
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
