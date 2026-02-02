import { withSerwist } from '@serwist/turbopack';
import { NextConfig } from 'next';

const nextConfig = withSerwist({
  cacheComponents: false,
  output: 'standalone',
  turbopack: {},
  serverExternalPackages: ['esbuild-wasm', 'esbuild', 'better-auth'],
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push('esbuild');
    }
    return config;
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'Referrer-Policy',
            value: 'no-referrer-when-downgrade',
          },
        ],
      },
    ];
  },
});

export default nextConfig;
