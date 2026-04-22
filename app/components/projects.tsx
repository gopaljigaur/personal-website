'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { ArrowIcon } from 'app/components/footer'
import { TagPill } from 'app/components/tag-pill'
import { LinkPreview } from 'app/components/link-preview'
import type { Project } from 'app/projects/data'

function tagUrl(tags: string[]) {
  return tags.length
    ? `/projects?tags=${tags.map(encodeURIComponent).join(',')}`
    : '/projects'
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <div className="flex min-h-56 flex-col rounded-xl border border-neutral-200 p-5 dark:border-neutral-800">
      {project.image && (
        <Image
          src={project.image}
          alt={project.title}
          width={600}
          height={300}
          className="mb-4 rounded-lg object-cover"
        />
      )}
      <p className="text-primary-inv font-medium">{project.title}</p>
      <p className="text-secondary-inv mt-2 flex-1 text-sm">
        {project.summary}
      </p>
      {project.links && project.links.length > 0 && (
        <div className="mt-4 flex gap-4 text-sm">
          {project.links.map(({ label, href }) => (
            <LinkPreview
              key={label}
              href={href}
              className="flex items-center gap-1.5 text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
            >
              <ArrowIcon />
              {label}
            </LinkPreview>
          ))}
        </div>
      )}
    </div>
  )
}

export function ProjectsWithFilter({
  projects,
  allTags,
}: {
  projects: Project[]
  allTags: string[]
}) {
  const [activeTags, setActiveTags] = useState<string[]>([])

  useEffect(() => {
    const tagsParam =
      new URLSearchParams(window.location.search).get('tags') ?? ''
    if (tagsParam) {
      setActiveTags(
        tagsParam
          .split(',')
          .map((t) => decodeURIComponent(t.trim()))
          .filter(Boolean),
      )
    }
  }, [])

  const toggleTag = (e: React.MouseEvent, tag: string) => {
    e.preventDefault()
    const next = activeTags.includes(tag)
      ? activeTags.filter((t) => t !== tag)
      : [...activeTags, tag]
    setActiveTags(next)
    window.history.replaceState({}, '', tagUrl(next))
  }

  const clearAll = (e: React.MouseEvent) => {
    e.preventDefault()
    setActiveTags([])
    window.history.replaceState({}, '', '/projects')
  }

  const filtered =
    activeTags.length > 0
      ? projects.filter((p) => p.techStack?.some((t) => activeTags.includes(t)))
      : projects

  return (
    <div>
      {allTags.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {allTags.map((tag) => {
            const next = activeTags.includes(tag)
              ? activeTags.filter((t) => t !== tag)
              : [...activeTags, tag]
            return (
              <TagPill
                key={tag}
                tag={tag}
                active={activeTags.includes(tag)}
                href={tagUrl(next)}
                onClick={(e) => toggleTag(e, tag)}
              />
            )
          })}
          {activeTags.length > 0 && (
            <button
              onClick={clearAll}
              className="shrink-0 rounded-full px-2.5 py-0.5 text-xs whitespace-nowrap text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
            >
              clear all
            </button>
          )}
        </div>
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {filtered.map((project) => (
          <ProjectCard key={project.title} project={project} />
        ))}
      </div>
    </div>
  )
}
