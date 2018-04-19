importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.1.0/workbox-sw.js');

/* global workbox */

// Force production builds
workbox.setConfig({ debug: false });

workbox.skipWaiting();
workbox.clientsClaim();

const backgroundSyncPlugin = new workbox.backgroundSync.Plugin('apiRequestQueue', {
  maxRetentionTime: 24 * 60 // Retry for max of 24 Hours
});

workbox.routing.registerRoute(
  /.*\.(?:js|html|css)/,
  workbox.strategies.cacheFirst({cacheName: workbox.core.cacheNames.precache})
);

workbox.routing.registerRoute(
  /.*(?:googleapis|gstatic)\.com.*$/,
  workbox.strategies.staleWhileRevalidate({cacheName: 'googleapi-cache'}),
);

workbox.routing.registerRoute(
  /.*\.(?:png|jpe?g|svg|gif)/,
  workbox.strategies.cacheFirst({cacheName: 'img-cache'})
);

workbox.routing.registerRoute(
  /\/api\/.*/,
  workbox.strategies.networkOnly({
    plugins: [backgroundSyncPlugin]
  }),
  'PUT'
);

workbox.routing.registerRoute(
  /\/api\/.*/,
  workbox.strategies.networkOnly({
    plugins: [backgroundSyncPlugin]
  }),
  'POST'
);

workbox.routing.registerRoute(
  /\/api\/.*/,
  workbox.strategies.networkOnly({
    plugins: [backgroundSyncPlugin]
  }),
  'DELETE'
);

workbox.routing.registerNavigationRoute('/index.html');

workbox.precaching.precacheAndRoute([]);
