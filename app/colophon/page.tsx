import type { Metadata } from 'next'
import { LinkPreview } from 'app/components/link-preview'

export const metadata: Metadata = {
  title: 'Colophon',
  description: 'How this site is built.',
}

type Item = {
  name: string
  url: string
  description: string
}

const sections: { heading: string; items: Item[] }[] = [
  {
    heading: 'Core',
    items: [
      {
        name: 'Next.js 16',
        url: 'https://nextjs.org',
        description:
          'App Router with server components, API routes, and image optimisation.',
      },
      {
        name: 'React 19',
        url: 'https://react.dev',
        description: 'New compiler and concurrent rendering.',
      },
      {
        name: 'Tailwind CSS v4',
        url: 'https://tailwindcss.com',
        description: 'Utility-first styling with custom design tokens.',
      },
      {
        name: 'TypeScript 6',
        url: 'https://www.typescriptlang.org',
        description: 'End-to-end type safety.',
      },
    ],
  },
  {
    heading: 'AI & Search',
    items: [
      {
        name: 'Gemini 2.5 Flash',
        url: 'https://ai.google.dev',
        description:
          'Powers the chat widget and code generation. The model answers questions about me by searching my content at runtime.',
      },
      {
        name: 'Gemini Embeddings',
        url: 'https://ai.google.dev/gemini-api/docs/embeddings',
        description:
          'Content is indexed into vectors at build time. No external database needed.',
      },
      {
        name: 'Vercel KV',
        url: 'https://vercel.com/docs/storage/vercel-kv',
        description: 'Response caching and rate limiting for AI features.',
      },
    ],
  },
  {
    heading: 'Content',
    items: [
      {
        name: 'MDX',
        url: 'https://mdxjs.com',
        description:
          'Blog posts written in Markdown with interactive components and syntax highlighting.',
      },
      {
        name: 'TinaCMS',
        url: 'https://tina.io',
        description:
          'Visual content editor used locally. Zero impact on the production build.',
      },
    ],
  },
  {
    heading: 'UI',
    items: [
      {
        name: 'Giscus',
        url: 'https://giscus.app',
        description:
          'Blog comments powered by GitHub Discussions. No separate account needed.',
      },
    ],
  },
  {
    heading: 'Testing',
    items: [
      {
        name: 'Vitest',
        url: 'https://vitest.dev',
        description:
          'Unit tests for pure functions. Integration tests for API routes with mocked dependencies.',
      },
      {
        name: 'Playwright',
        url: 'https://playwright.dev',
        description:
          'E2E tests for blog TOC, tag filtering, and link previews.',
      },
    ],
  },
  {
    heading: 'Deployment',
    items: [
      {
        name: 'Vercel',
        url: 'https://vercel.com',
        description:
          'Every push to main deploys automatically. Fluid Compute for all serverless functions.',
      },
      {
        name: 'GitHub Actions',
        url: 'https://github.com/features/actions',
        description:
          'CI runs unit + integration tests on every PR, E2E on every merge.',
      },
    ],
  },
]

export default function ColophonPage() {
  return (
    <section>
      <h1 className="title mb-10 text-2xl font-semibold tracking-tighter">
        Colophon
      </h1>

      <div className="space-y-10">
        {sections.map(({ heading, items }) => (
          <div key={heading}>
            <h2 className="mb-3 text-xs font-semibold tracking-widest text-neutral-400 uppercase dark:text-neutral-500">
              {heading}
            </h2>
            <ul className="space-y-3">
              {items.map(({ name, url, description }) => (
                <li key={name}>
                  <span className="prose text-sm">
                    <LinkPreview href={url}>{name}</LinkPreview>
                  </span>
                  <p className="text-secondary-inv mt-0.5 text-sm">
                    {description}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
