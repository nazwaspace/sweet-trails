import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst, NetworkFirst } from 'workbox-strategies';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { ExpirationPlugin } from 'workbox-expiration';
import { clientsClaim, setCacheNameDetails } from 'workbox-core';

clientsClaim();
self.skipWaiting();

setCacheNameDetails({
  suffix: 'sweet-trails-v1'
});

precacheAndRoute(self.__WB_MANIFEST);

registerRoute(
    ({ url }) => url.href.startsWith('https://story-api.dicoding.dev/v1/stories'),
    new NetworkFirst({
        cacheName: 'story-api-cache',
        plugins: [
            new CacheableResponsePlugin({
                statuses: [0, 200],
            }),
            new ExpirationPlugin({
                maxEntries: 50,
                maxAgeSeconds: 30 * 24 * 60 * 60,
            }),
        ],
    })
);

registerRoute(
    ({ request, url }) => request.destination === 'image' && url.href.startsWith('https://story-api.dicoding.dev/v1/stories'),
    new CacheFirst({
        cacheName: 'story-image-cache',
        plugins: [
            new CacheableResponsePlugin({
                statuses: [0, 200],
            }),
            new ExpirationPlugin({
                maxEntries: 60,
                maxAgeSeconds: 30 * 24 * 60 * 60,
            }),
        ],
    })
);

registerRoute(
  ({ url }) => url.href.startsWith('https://') && (url.href.includes('tile.openstreetmap.org') || url.href.includes('server.arcgisonline.com')),
  new CacheFirst({
    cacheName: 'map-tiles-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 200,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Hari
      }),
    ],
  })
);

self.addEventListener('push', (event) => {
  let data = { title: 'Default Title', body: 'Default Message', options: { url: '/' } };
  try {
    data = event.data.json();
  } catch (error) {
    data = {
      title: 'New Notification',
      body: event.data.text(),
      options: {
        url: 'index.html'
      }
    };
  }

  const options = {
    body: data.body,
    icon: 'icons/icon-192x192.png',
    badge: 'icons/icon-192x192.png',
    data: {
      url: data.options.url,
    },
    actions: [
      { action: 'open_story', title: 'Open' },
      { action: 'close', title: 'Close' },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const action = event.action;
  if (action === 'open_story') {
    let urlToOpen = event.notification.data.url || 'index.html';
    if (urlToOpen.startsWith('/')) {
        urlToOpen = urlToOpen.substring(1);
    }
    event.waitUntil(
      clients.openWindow(urlToOpen)
    );
  }
});