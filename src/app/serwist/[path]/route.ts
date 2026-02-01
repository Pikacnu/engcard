// app/serwist/[path]/route.ts
import { spawnSync } from 'node:child_process';
import { createSerwistRoute } from '@serwist/turbopack';
import { serwistOptions } from '@/sw';
import nextConfig from '../../../../next.config';

const revision =
  spawnSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf-8' }).stdout ??
  crypto.randomUUID();

export const { dynamic, dynamicParams, revalidate, generateStaticParams, GET } =
  createSerwistRoute({
    ...serwistOptions,
    additionalPrecacheEntries: [
      { url: '/appenter', revision },
      { url: '/dashboard', revision },
      { url: '/dashboard/chat', revision },
      { url: '/dashboard/deck', revision },
      { url: '/dashboard/search', revision },
      { url: '/dashboard/settings', revision },
      { url: '/dashboard/preview', revision },
    ],
    swSrc: 'src/sw.ts',
    nextConfig: nextConfig as any,
  });
