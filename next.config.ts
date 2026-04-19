import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['next-mdx-remote'],
  pageExtensions: ['ts', 'tsx', 'mdx'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.gravatar.com',
        port: '',
        pathname: '/avatar/**',
      },
    ],
  },
  experimental: {
    viewTransition: true,
  },
  redirects: async () => [
    {
      source: '/admin',
      destination: '/admin/index.html',
      permanent: false,
    },
    {
      source: '/cv',
      destination: '/cv/ml',
      permanent: false,
    },
    {
      source: '/cv/ml',
      destination: '/cv/CV_Gopalji_Gaur_ML_Engineer.pdf',
      permanent: false,
    },
    {
      source: '/cv/research',
      destination: '/cv/CV_Gopalji_Gaur_Research_Engineer.pdf',
      permanent: false,
    },
    {
      source: '/cv/ai',
      destination: '/cv/CV_Gopalji_Gaur_AI_Application_Developer.pdf',
      permanent: false,
    },
    {
      source: '/cv/software',
      destination: '/cv/CV_Gopalji_Gaur_Software_Engineer.pdf',
      permanent: false,
    },
    {
      source: '/cv/data',
      destination: '/cv/CV_Gopalji_Gaur_Data_Scientist.pdf',
      permanent: false,
    },
  ],
  headers: async () => {
    return [
      {
        source: '/comments.css',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: 'https://giscus.app',
          },
        ],
      },
    ]
  },
}

export default nextConfig
