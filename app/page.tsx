import { BlogPosts } from 'app/components/posts'
import { MainBanner } from 'app/components/banner'

export default function Page() {
  return (
      <section>
          <MainBanner />
          <p className="mb-4">
              {`Hey, I'm Gopalji, a Machine Learning Engineer based in Germany. In addition to dwelling 
        among the interconnections of the Neural Networks, I sometimes like to wrap my head around 
        various web development projects.`}
          </p>
          <div className="my-8">
              <BlogPosts/>
          </div>
      </section>
  )
}
