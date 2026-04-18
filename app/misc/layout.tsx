import { Banner } from 'app/components/banner'

export default function MiscLayout({
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
