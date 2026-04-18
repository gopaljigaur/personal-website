import { MainBanner } from 'app/components/banner'
import { profile } from 'app/lib/profile'

export default function Page() {
  return (
    <section>
      <MainBanner />
      <p className="mb-4">{profile.bio}</p>
    </section>
  )
}
