import fs from 'node:fs'
import path from 'node:path'
import Link from 'next/link'
import type { Metadata } from 'next'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export const metadata: Metadata = {
  title: 'Attention, chunks and training memory',
  description:
    'A local CPU investigation with PyTorch implementations, gradient checks and autograd storage measurements.',
  robots: { index: false, follow: false },
}

export default function AttentionNote() {
  const content = fs.readFileSync(
    path.join(process.cwd(), 'content/attention-note.md'),
    'utf8',
  )
  return (
    <section>
      <Link
        href="/"
        className="mb-8 inline-block text-sm underline underline-offset-4"
      >
        Back to home
      </Link>
      <article className="prose max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      </article>
    </section>
  )
}
