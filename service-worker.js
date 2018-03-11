const STATIC_ASSETS = 'static-assets-v6';

// str -> promise(bool)
const deleteCache = x => caches.delete(x);

// str -> str -> bool
const not = x => y => y !== x;

// eslint-disable-next-line no-console
const trace = tag => x => (console.log(tag, x), x);

// promise([bool])
const clearOldCaches = () => {
  return caches.keys().then(cacheNames => {
    return Promise.all(cacheNames
      .filter(not(STATIC_ASSETS))
      .map(trace('caches to delete'))
      .map(deleteCache));
  }).catch(() => null);
};

// _ -> promise([response])
const precache = async () => {
  const cache = await caches.open(STATIC_ASSETS);
  return cache.addAll([
    // App assets
    '/index.html',
    '/restaurant.html',
    '/css/styles.css',
    '/data/restaurants.json',
    // Vendor assets - local
    'bower_components/lazy-imports/lazy-imports-mixin.html',
    'bower_components/polymer/lib/mixins/element-mixin.html',
    'bower_components/polymer/lib/utils/html-tag.html',
    'bower_components/polymer/lib/utils/import-href.html',
    'bower_components/polymer/polymer-element.html',
    'bower_components/service-worker/service-worker.html',
    'bower_components/webcomponentsjs/webcomponents-loader.js',
  ]);
};

// request -> promise(void)
const updateCache = async request => {
  const cache = await caches.open(STATIC_ASSETS);
  const response = await fetch(request).catch(() => null);
  return cache.put(request, response);
};

// request -> promise(response)
const fromCacheOrFetch = async request => {
  const cache = await caches.open(STATIC_ASSETS);
  const match = await cache.match(request);
  return match || fetch(request).catch(() => null);
};

self.addEventListener('install', event => {
  event.waitUntil(precache().catch(() => null));
});

self.addEventListener('activate', event => {
  event.waitUntil(clearOldCaches().catch(() => null));
});

self.addEventListener('fetch', event => {
  event.respondWith(fromCacheOrFetch(event.request).catch(() => null));
  event.waitUntil(updateCache(event.request).catch(() => null));
});

self.addEventListener('message', event => {
  switch (event.data.action) {
    case 'skipWaiting': {
      self.skipWaiting();
      self.clients.claim();
      return;
    }
  }
});
