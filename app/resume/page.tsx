import { ArrowIcon } from 'app/components/footer'

export const metadata = {
  title: 'Resume',
  description: 'CV variants for different roles.',
}

const cvs = [
  {
    label: 'ML Engineer',
    file: '/cv/ml',
    description: 'Transformer architectures, distributed training, LLM systems',
  },
  {
    label: 'Research Engineer',
    file: '/cv/research',
    description: 'Neural architecture search, scalable training, AutoML',
  },
  {
    label: 'AI Application Developer',
    file: '/cv/ai',
    description: 'LLM pipelines, agentic systems, full-stack AI products',
  },
  {
    label: 'Software Engineer',
    file: '/cv/software',
    description: 'TypeScript, Python, AI integration, cloud infrastructure',
  },
  {
    label: 'Data Scientist',
    file: '/cv/data',
    description: 'Evaluation methodology, multimodal learning, experimentation',
  },
]

export default function ResumePage() {
  return (
    <section>
      <h1 className="mb-8 text-2xl font-semibold tracking-tighter">Resume</h1>
      <ul className="space-y-4">
        {cvs.map(({ label, file, description }) => (
          <li key={file}>
            <a
              href={file}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start justify-between rounded-md py-2 transition-all hover:text-neutral-800 dark:hover:text-neutral-100"
            >
              <div>
                <p className="font-medium">{label}</p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {description}
                </p>
              </div>
              <span className="mt-1 ml-4 shrink-0 text-neutral-400 transition-all group-hover:text-neutral-800 dark:group-hover:text-neutral-100">
                <ArrowIcon />
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
