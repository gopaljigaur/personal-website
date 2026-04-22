import { ProjectsWithFilter } from 'app/components/projects'
import { projects } from 'app/projects/data'
import ProjectsClient from './projects-client'

export const metadata = {
  title: 'Projects',
  description: 'Take a look at stuff I made.',
}

export default async function Page() {
  if (process.env.NODE_ENV === 'development') {
    try {
      // @ts-ignore
      const { client } = await import('../../tina/__generated__/client')
      const tinaData = await client.queries.projects({
        relativePath: 'projects.json',
      })
      return (
        <ProjectsClient
          query={tinaData.query}
          variables={tinaData.variables}
          data={tinaData.data}
        />
      )
    } catch {
      // TinaCMS server not running — fall through to static rendering
    }
  }

  const allTags = [
    ...new Set(projects.flatMap((p) => p.techStack ?? [])),
  ].sort()

  return <ProjectsWithFilter projects={projects} allTags={allTags} />
}
