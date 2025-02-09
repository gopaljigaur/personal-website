import './global.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Navbar } from './components/nav'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import Footer from './components/footer'
import { baseUrl } from './sitemap'
import { unstable_ViewTransition as ViewTransition } from 'react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'Gopalji Gaur',
    template: '%s | Gopalji Gaur',
  },
  description: 'Gopalji Gaur. Machine Learning Engineer. Builder and innovator. Based in Germany.',
  openGraph: {
    title: 'Gopalji Gaur',
    description: 'Gopalji Gaur. Machine Learning Engineer. Builder and innovator. Based in Germany.',
    url: baseUrl,
    siteName: 'Goaplji Gaur',
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={cx(
        'text-neutral-800 bg-white dark:text-neutral-400 dark:bg-neutral-950',
        inter.className
      )}
    >
      <body className="antialiased max-w-2xl mx-4 lg:mx-auto flex flex-col min-h-screen">
        <main className="flex-auto min-w-0 mt-8 flex flex-col px-2 md:px-0">
          <Navbar />
          <ViewTransition>{children}</ViewTransition>
        </main>
          <Footer />
          <Analytics />
          <SpeedInsights />
      </body>
    </html>
  )
}
