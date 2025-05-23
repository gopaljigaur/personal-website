import { getBlogPosts } from 'app/blog/utils'
import { getProjects } from "app/projects/utils"

export const baseUrl = 'https://gopalji.me'

export default async function sitemap() {
  let blogs = getBlogPosts().map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.metadata.publishedAt,
  }))

  let projects = getProjects().map((project) => ({
      url: `${baseUrl}/projects/${project.slug}`,
      lastModified: project.metadata.publishedAt,
  }))

  let routes = ['', '/blog', '/projects'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString().split('T')[0],
  }))

  return [...routes, ...blogs, ...projects]
}
