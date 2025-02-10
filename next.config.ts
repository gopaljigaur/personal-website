import type { NextConfig } from 'next'


const nextConfig: NextConfig = {
    transpilePackages: ['next-mdx-remote'],
    pageExtensions: ['ts',  'tsx', 'mdx'],
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'www.gravatar.com',
                port: '',
                pathname: '/avatar/**'
            }
        ]
    },
    experimental: {
        mdxRs: true,
        viewTransition: true,
        newDevOverlay: true
    }
}

export default nextConfig;