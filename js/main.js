import { attemptCatchUp } from './db/cacheRequest.js';
import { installRouter } from './router.js';
import { map } from './lib.js';

const app = document.getElementById('app');

const imports = {
  list: [
    './restaurant-card.js',
    './restaurant-filters.js',
    './view-list.js',
    './map-marker.js',
  ],
  restaurant: [
    './review-card.js',
  ],
};

const scrollToTop = () => scrollTo(0, 0);

const importSpecifier = specifier => import(specifier);

const parallelizeImports = map(importSpecifier);

const runDefault = ({ default: moduleDefault }) =>
  moduleDefault();

const router = ({ pathname }) => {
  // hook styles up to views
  const page = pathname === '/' ? 'list' : 'restaurant';
        page === 'restaurant'
          ? app.classList.add('restaurant')
          : app.classList.remove('restaurant');

  // Parallelize loading to speed up critical path render
  parallelizeImports( imports[page] );

  // let 'er rip 🏎
  return import(`./route-${page}.js`)
    .then(runDefault)
    .then(scrollToTop);
};

installRouter(router);

attemptCatchUp();

const upgradeElements = () => parallelizeImports([
  '/node_modules/@power-elements/emoji-checkbox/emoji-checkbox.js',
  '/node_modules/@power-elements/lazy-image/lazy-image.js',
  '/node_modules/@power-elements/service-worker/service-worker.js',
  '/bower_components/good-map/good-map.js',
]);

requestIdleCallback(upgradeElements);
