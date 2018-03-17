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

workbox.precaching.precacheAndRoute([
  {
    "url": "bower_components/good-map/bower.json",
    "revision": "55a230533050ba161b4bb8fe9a033c96"
  },
  {
    "url": "bower_components/good-map/demo/index.html",
    "revision": "a9a0cdb4cbff2fc540b8647ffc5a6992"
  },
  {
    "url": "bower_components/good-map/good-map.html",
    "revision": "5f43ebef3e88a64199a6e869aebfee69"
  },
  {
    "url": "bower_components/good-map/good-map.js",
    "revision": "edde046183ec39768ed2af2b9d6e38ce"
  },
  {
    "url": "bower.json",
    "revision": "da96eaef82dc58f846f0fae79cb6077c"
  },
  {
    "url": "css/restaurant.css",
    "revision": "355d30b6cc7c55a227f8275631ca65e1"
  },
  {
    "url": "data.json",
    "revision": "980ac8ff84a75945fc9e39d3b2cd08e5"
  },
  {
    "url": "data/restaurants.json",
    "revision": "81a7e103ed5aefced34fa055e2c2cfec"
  },
  {
    "url": "index.html",
    "revision": "3ba8458596f39703bb3290f56ac15776"
  },
  {
    "url": "js/dbhelper.js",
    "revision": "88c8920139415bd615e057df934150e6"
  },
  {
    "url": "js/idb-keyval.js",
    "revision": "a11884ffb08763476b432378fa1a1b96"
  },
  {
    "url": "js/lib.js",
    "revision": "cb6bb5b6d5171de372c275a628af76e3"
  },
  {
    "url": "js/map-marker.js",
    "revision": "cb96fdac5becdc227c6eee751f0d9d74"
  },
  {
    "url": "js/restaurant-card.js",
    "revision": "1a0d3fe5cd02186c428651743ebb22e4"
  },
  {
    "url": "js/restaurant-list.js",
    "revision": "c9c978bc5fc8c442a926db54613ba5a3"
  },
  {
    "url": "js/restaurant-reviews.js",
    "revision": "36760eb9d3d23eda6c2bd56403ff0c59"
  },
  {
    "url": "js/restaurant-reviews.min.js",
    "revision": "c9b4f391cccee2f9c7e16964d4a9df97"
  },
  {
    "url": "js/restaurant-styles.js",
    "revision": "2e48fe79ab094d86495974ef7c0afd81"
  },
  {
    "url": "js/restaurant-view.js",
    "revision": "1b1ee9f49af1ece3b1b1886a8ffcd4a2"
  },
  {
    "url": "js/review-card.js",
    "revision": "e43a62fc985292d99668fb8a1ed13e81"
  },
  {
    "url": "js/router.js",
    "revision": "31864802ff5ba9b9046b3b5c3727fc79"
  },
  {
    "url": "js/styles.js",
    "revision": "f8ffe9417cc8bec8b28f53af2bda0d16"
  },
  {
    "url": "js/submit-review.js",
    "revision": "120f7d02ce5ad29d936e7071d418e21a"
  },
  {
    "url": "lws.config.js",
    "revision": "b888d31491ecfc998ff2ac54f1aef741"
  },
  {
    "url": "lws.redirect.config.js",
    "revision": "bc4a85df301106ec28f3d9f5ebce26a0"
  },
  {
    "url": "manifest.json",
    "revision": "4b82593a5d1a9caba5ba974fcc113efb"
  },
  {
    "url": "package-lock.json",
    "revision": "89d1e9010be4477e47fe76ff19c6ef5f"
  },
  {
    "url": "package.json",
    "revision": "8629397c2eda46edabf894abd137b10f"
  },
  {
    "url": "redirect-everything.js",
    "revision": "cfa39c6656f521e1cadfd06b0f2e8c7f"
  },
  {
    "url": "restaurant-mocks.js",
    "revision": "a782f3a3006e224fb84646d5ac669459"
  },
  {
    "url": "rollup.config.js",
    "revision": "6ff7f992b4affb9d6f2520aaf82ff383"
  },
  {
    "url": "service-worker.src.js",
    "revision": "e543372128169d9508033ea6fc7215c1"
  },
  {
    "url": "stylelint.config.js",
    "revision": "d88f5374fbb4aeccbda6b2feedafdd41"
  },
  {
    "url": "workbox-config.js",
    "revision": "f6d7a3b0eeb367e79b5201fe247e3ec5"
  }
]);
