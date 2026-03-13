import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        has: [
          {
            type: 'host',
            value: '(?<host>.*)',
          },
        ],
        destination: 'http://localhost:8000/api/:path*',
      },
    ]
  },
};

export default nextConfig;
