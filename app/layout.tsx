import './global.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Navbar } from './components/nav'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import Footer from './components/footer'
import { Providers } from './components/providers'
import { SearchChatModal } from './components/search-chat-modal'
import { getBlogPosts } from './blog/utils'
import { projects } from './projects/data'
import { baseUrl } from './sitemap'
import { profile } from './lib/profile'
import { ViewTransition } from 'react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'Gopalji Gaur',
    template: '%s | Gopalji Gaur',
  },
  description:
    'Gopalji Gaur. Machine Learning Engineer. Builder and innovator. Based in Germany.',
  openGraph: {
    title: 'Gopalji Gaur',
    description:
      'Gopalji Gaur. Machine Learning Engineer. Builder and innovator. Based in Germany.',
    url: baseUrl,
    siteName: 'Gopalji Gaur',
    locale: 'en_US',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

const cx = (...classes: string[]) => classes.filter(Boolean).join(' ')

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      url: baseUrl,
      name: profile.name,
      description: `${profile.name}. ${profile.title}. Based in ${profile.location}.`,
    },
    {
      '@type': 'Person',
      name: profile.name,
      url: baseUrl,
      jobTitle: profile.title,
      worksFor: { '@type': 'Organization', name: profile.workplace },
      sameAs: [profile.contact.github, profile.contact.linkedin].filter(
        Boolean,
      ),
    },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const posts = getBlogPosts().map((p) => ({
    title: p.metadata.title,
    slug: p.slug,
    summary: p.metadata.summary,
  }))
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={cx(
          'dark:text-dark-text-secondary mx-4 flex min-h-screen max-w-2xl flex-col bg-white text-neutral-800 antialiased lg:mx-auto dark:bg-neutral-950',
          inter.className,
        )}
      >
        <Providers>
          <main className="mt-8 flex min-w-0 flex-auto flex-col px-2 md:px-0">
            <Navbar />
            <ViewTransition>{children}</ViewTransition>
          </main>
          <Footer />
          <SearchChatModal
            posts={posts}
            projects={projects.map((p) => ({
              title: p.title,
              summary: p.summary,
              href: p.links?.[0]?.href ?? '/projects',
            }))}
          />
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
