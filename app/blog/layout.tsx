import { Banner } from 'app/components/banner'

export default function BlogLayout({
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
