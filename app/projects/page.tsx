import { ProjectsWithFilter } from 'app/components/projects'
import { projects } from 'app/projects/data'

export const metadata = {
  title: 'Projects',
  description: 'Take a look at stuff I made.',
}

export default async function Page(props: {
  searchParams: Promise<Record<string, string>>
}) {
  const searchParams = await props.searchParams
  const tagsParam = searchParams?.tags ?? ''
  const activeTags = tagsParam
    ? tagsParam
        .split(',')
        .map((t) => decodeURIComponent(t.trim()))
        .filter(Boolean)
    : []
  const allTags = [
    ...new Set(projects.flatMap((p) => p.techStack ?? [])),
  ].sort()

  return (
    <ProjectsWithFilter
      projects={projects}
      allTags={allTags}
      activeTags={activeTags}
    />
  )
}
