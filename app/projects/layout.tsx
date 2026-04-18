import { Banner } from 'app/components/banner'

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <section>
      <Banner />
      {children}
    </section>
  )
}
