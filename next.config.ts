import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.hamburgpapier-shop.de',
        pathname: '/media/**',
      },
    ],
  },
}

export default nextConfig
