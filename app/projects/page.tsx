import { Projects } from 'app/components/projects'
import { Banner } from "app/components/banner";

export const metadata = {
  title: 'Projects',
  description: 'Take a look at stuff I made.',
}

export default function Page() {
  return (
    <section>
      <Banner>projects</Banner>
      <Projects />
    </section>
  )
}
