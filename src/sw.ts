import { defaultCache } from '@serwist/next/worker';
import {
  BackgroundSyncPlugin,
  type PrecacheEntry,
  PrecacheOptions,
  RouteMatchCallback,
  RouteMatchCallbackOptions,
  RuntimeCaching,
  Serwist,
  StaleWhileRevalidate,
} from 'serwist';

declare const self: ServiceWorkerGlobalScopeEventMap & {
  __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
};

const ResourceCacheCreator = (resourceName: string): RuntimeCaching => {
  return {
    matcher: ({ request }) => request.destination === resourceName,
    method: 'GET',
    handler: new StaleWhileRevalidate({
      cacheName: `${resourceName}-cache`,
      plugins: [
        new BackgroundSyncPlugin(`${resourceName}-queue`, {
          maxRetentionTime: 24 * 60, // Retry for max of 24 Hours (specified in minutes)
        }),
      ],
    }),
  } as RuntimeCaching;
};

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  precacheOptions: {
    cleanupOutdatedCaches: true,
    concurrency: 20,
    //navigateFallback: '/',
  } as PrecacheOptions,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    ...defaultCache,
    ResourceCacheCreator('audio'),
    ResourceCacheCreator('image'),
    ResourceCacheCreator('font'),
  ],
});

serwist.addEventListeners();
