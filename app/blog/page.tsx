import { BlogPosts } from 'app/components/posts'
import { Banner } from "../components/banner";

export const metadata = {
  title: 'Blog',
  description: 'Read my blog.',
}

export default function Page() {
  return (
    <section>
      <Banner />
      <BlogPosts />
    </section>
  )
}
