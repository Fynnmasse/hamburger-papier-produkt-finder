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
  async redirects() {
    return [
      { source: '/jumbotoilettenpapier', destination: '/toilettenpapier/jumborollen', permanent: true },
      { source: '/jumbotoilettenpapier/:path*', destination: '/toilettenpapier/jumborollen/:path*', permanent: true },
      { source: '/spender', destination: '/waschraum/spender', permanent: true },
      { source: '/spender/:path*', destination: '/waschraum/spender/:path*', permanent: true },
      { source: '/hygienespender', destination: '/waschraum/spender', permanent: true },
      { source: '/hygienespender/:path*', destination: '/waschraum/spender/:path*', permanent: true },
      { source: '/seife', destination: '/waschraum/cremeseife', permanent: true },
      { source: '/seife/:path*', destination: '/waschraum/cremeseife', permanent: true },
      { source: '/servietten', destination: '/reinigung/servietten', permanent: true },
      { source: '/servietten/:path*', destination: '/reinigung/servietten/:path*', permanent: true },
      { source: '/aerztekrepp', destination: '/reinigung/aerztekrepp', permanent: true },
      { source: '/aerztekrepp/:path*', destination: '/reinigung/aerztekrepp/:path*', permanent: true },
      { source: '/mikrofasertuecher', destination: '/reinigung/mikrofasertuecher', permanent: true },
      { source: '/mikrofasertuecher/:path*', destination: '/reinigung/mikrofasertuecher/:path*', permanent: true },
      { source: '/wischmop', destination: '/reinigung/wischmop', permanent: true },
      { source: '/wischmop/:path*', destination: '/reinigung/wischmop/:path*', permanent: true },
      { source: '/kosmetiktuecher', destination: '/waschraum/kosmetiktuecher', permanent: true },
      { source: '/kosmetiktuecher/:path*', destination: '/waschraum/kosmetiktuecher/:path*', permanent: true },
    ]
  },
}

export default nextConfig
