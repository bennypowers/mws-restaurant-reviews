importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.0.0/workbox-sw.js');

/* global workbox */

workbox.skipWaiting();
workbox.clientsClaim();

workbox.routing.registerNavigationRoute('/index.html');

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
  workbox.strategies.cacheFirst({cacheName: 'data-cache'})
);

workbox.precaching.precacheAndRoute([
  '/img/1.jpg',
  '/img/2.jpg',
  '/img/3.jpg',
  '/img/4.jpg',
], {cachename: 'img-cache'});

workbox.precaching.precacheAndRoute([]);
