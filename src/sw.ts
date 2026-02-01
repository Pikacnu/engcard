import { defaultCache } from '@serwist/next/worker';
import {
  BackgroundSyncPlugin,
  type PrecacheEntry,
  PrecacheOptions,
  Serwist,
  StaleWhileRevalidate,
  CacheFirst,
  RangeRequestsPlugin,
  type RuntimeCaching,
} from 'serwist';

declare const self: ServiceWorkerGlobalScopeEventMap & {
  __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
};

// 針對通用資源的快取產生器
const ResourceCacheCreator = (
  resourceName: string,
  strategy: any = StaleWhileRevalidate,
): RuntimeCaching => {
  return {
    matcher: ({ request }) => request.destination === resourceName,
    method: 'GET',
    handler: new strategy({
      cacheName: `${resourceName}-cache`,
      plugins: [
        new BackgroundSyncPlugin(`${resourceName}-queue`, {
          maxRetentionTime: 24 * 60,
        }),
        ...(resourceName === 'audio' || resourceName === 'video'
          ? [new RangeRequestsPlugin()]
          : []),
      ],
    }),
  } as RuntimeCaching;
};

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  precacheOptions: {
    cleanupOutdatedCaches: true,
    concurrency: 20,
  } as PrecacheOptions,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    ...defaultCache,
    ResourceCacheCreator('audio', CacheFirst), // 音檔採用 CacheFirst 節省流量並確保離線可用
    ResourceCacheCreator('image'),
    ResourceCacheCreator('font'),
  ],
});

serwist.addEventListeners();
