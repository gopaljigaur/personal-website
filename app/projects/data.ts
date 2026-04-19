import projectsData from 'content/projects.json'

export type Project = {
  title: string
  summary: string
  image?: string
  techStack?: string[]
  links?: { label: string; href: string }[]
}

export const projects: Project[] = projectsData.projects
