import Image from 'next/image'
import Link from 'next/link'
import { ArrowIcon } from 'app/components/footer'
import { TagPill } from 'app/components/tag-pill'
import type { Project } from 'app/projects/data'

function tagHref(tag: string, activeTags: string[]) {
  const next = activeTags.includes(tag)
    ? activeTags.filter((t) => t !== tag)
    : [...activeTags, tag]
  return next.length === 0
    ? '/projects'
    : `/projects?tags=${next.map(encodeURIComponent).join(',')}`
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
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
            >
              <ArrowIcon />
              {label}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

export function ProjectsWithFilter({
  projects,
  allTags,
  activeTags,
}: {
  projects: Project[]
  allTags: string[]
  activeTags: string[]
}) {
  const filtered =
    activeTags.length > 0
      ? projects.filter((p) => p.techStack?.some((t) => activeTags.includes(t)))
      : projects

  return (
    <div>
      {allTags.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {allTags.map((tag) => (
            <TagPill
              key={tag}
              tag={tag}
              active={activeTags.includes(tag)}
              href={tagHref(tag, activeTags)}
            />
          ))}
          {activeTags.length > 0 && (
            <Link
              href="/projects"
              className="shrink-0 rounded-full px-2.5 py-0.5 text-xs whitespace-nowrap text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
            >
              clear all
            </Link>
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
