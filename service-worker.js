importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.0.0/workbox-sw.js');

/* global workbox */

workbox.skipWaiting();
workbox.clientsClaim();

workbox.routing.registerRoute(
  /.*\.(?:html|js|css)/,
  workbox.strategies.staleWhileRevalidate({cacheName: 'static-cache'})
);

workbox.routing.registerRoute(
  /.*\.(?:png|jpe?g|svg|gif)/,
  workbox.strategies.cacheFirst({cacheName: 'img-cache'})
);

workbox.routing.registerRoute(
  /\/api\/.*/,
  workbox.strategies.cacheFirst({cacheName: 'img-cache'})
);
