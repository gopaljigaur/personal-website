import Image from 'next/image'
import { ArrowIcon } from 'app/components/footer'
import { projects } from 'app/projects/data'
import type { Project } from 'app/projects/data'

function ProjectCard({ project }: { project: Project }) {
  return (
    <div className="flex min-h-48 flex-col rounded-xl border border-neutral-200 p-5 dark:border-neutral-800">
      {project.image && (
        <Image
          src={project.image}
          alt={project.title}
          width={600}
          height={300}
          className="mb-4 rounded-lg object-cover"
        />
      )}
      <p className="font-medium text-neutral-900 dark:text-neutral-100">
        {project.title}
      </p>
      <p className="mt-2 line-clamp-3 flex-1 text-sm text-neutral-600 dark:text-neutral-400">
        {project.summary}
      </p>
      {project.techStack && project.techStack.length > 0 && (
        <p className="mt-4 text-xs text-neutral-500 dark:text-neutral-400">
          {project.techStack.join(' · ')}
        </p>
      )}
      {(project.links?.github || project.links?.live) && (
        <div className="mt-4 flex gap-4 text-sm">
          {project.links.github && (
            <a
              href={project.links.github}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
            >
              <ArrowIcon />
              GitHub
            </a>
          )}
          {project.links.live && (
            <a
              href={project.links.live}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
            >
              <ArrowIcon />
              Live
            </a>
          )}
        </div>
      )}
    </div>
  )
}

export function Projects() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {projects.map((project) => (
        <ProjectCard key={project.title} project={project} />
      ))}
    </div>
  )
}
