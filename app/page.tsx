import { MainBanner } from 'app/components/banner'

export default function Page() {
  return (
    <section>
      <MainBanner />
      <p className="mb-4">
        {`I've been into computers and engineering from a very young age. My background is in ML research. I've worked with diffusion models and transformers, and lately most of my time goes into AI agents. I also build things for the web, this site included.`}
      </p>
    </section>
  )
}
