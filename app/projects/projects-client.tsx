'use client'

import { useMemo } from 'react'
import { useTina } from 'tinacms/dist/react'
import { ProjectsWithFilter } from 'app/components/projects'
import type { Project } from 'app/projects/data'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ProjectsClient({
  query,
  variables,
  data,
  activeTags,
}: {
  query: string
  variables: Record<string, unknown>
  data: any
  activeTags: string[]
}) {
  const { data: tinaData } = useTina({ query, variables, data })
  const projects: Project[] = tinaData.projects.projects ?? []
  const allTags = useMemo(
    () => [...new Set(projects.flatMap((p) => p.techStack ?? []))].sort(),
    [projects],
  )

  return (
    <ProjectsWithFilter
      projects={projects}
      allTags={allTags}
      activeTags={activeTags}
    />
  )
}
