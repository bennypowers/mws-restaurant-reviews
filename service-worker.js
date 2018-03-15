const STATIC_ASSETS = 'static-assets-v6';

const noop = () => null;

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
  }).catch(noop);
};

// _ -> promise([response])
const precache = async () => {
  const cache = await caches.open(STATIC_ASSETS);
  return cache.addAll([
    // App assets
    '/css/restaurant.css',
    'js/restaurant-card.js',
    'js/restaurant-list.js',
    'js/restaurant-reviews.js',
    'js/restaurant-styles.js',
    'js/restaurant-view.js',
    'js/review-card.js',
    'js/submit-review.js',
    // Vendor assets - local
    'bower_components/good-map/good-map.js',
    'node_modules/@polymer/lit-element/lit-element.js',
  ]).catch(noop);
};

// request -> promise(void)
const updateCache = async request => {
  const cache = await caches.open(STATIC_ASSETS);
  const response = await fetch(request).catch(noop);
  return cache.put(request, response);
};

// request -> promise(response)
const fromCacheOrFetch = async request => {
  const cache = await caches.open(STATIC_ASSETS);
  const match = await cache.match(request);
  return match || fetch(request).catch(noop);
};

self.addEventListener('install', event => {
  event.waitUntil(precache());
});

self.addEventListener('activate', event => {
  event.waitUntil(clearOldCaches().catch(noop));
});

self.addEventListener('fetch', event => {
  event.respondWith(fromCacheOrFetch(event.request).catch(noop));
  event.waitUntil(updateCache(event.request).catch(noop));
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
