import { attemptCatchUp } from './db/cacheRequest.js';
import { installRouter } from './router.js';

const app = document.getElementById('app');

const listSpecifier = './route-list.js';
const restSpecifier = './route-restaurant.js';

const list = [
  './restaurant-card.js',
  './restaurant-filters.js',
  './restaurant-list.js',
  './map-marker.js',
];

const rest = [

];

const imports = ({ list, rest });

const importSpecifier = specifier => import(specifier);

const runDefault = ({ app }) =>
  module => module.default({ app });

const router = async location => {
  const shouldImport = location.pathname === '/' ? 'list' : 'rest';
  Promise.all(imports[shouldImport].map(importSpecifier));
  return import(shouldImport === 'list' ? listSpecifier : restSpecifier)
    .then(runDefault({ app }));
};

installRouter(router);

attemptCatchUp();

const upgradeElements = () => Promise.all([
  import('/node_modules/@power-elements/emoji-checkbox/emoji-checkbox.js'),
  import('/node_modules/@power-elements/lazy-image/lazy-image.js'),
  import('/node_modules/@power-elements/service-worker/service-worker.js'),
  import('/bower_components/good-map/good-map.js'),
]);

requestIdleCallback(upgradeElements);
