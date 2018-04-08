import { attemptCatchUp } from './db/cacheRequest.js';
import { installRouter } from './router.js';

const app = document.getElementById('app');

const listSpecifier = './route-list.js';
const restSpecifier = './route-restaurant.js';

const runDefault = ({ app }) =>
  module => module.default({ app });

const router = async location =>
  import(location.pathname === '/' ? listSpecifier : restSpecifier)
    .then(runDefault({ app }));

const upgradeServiceWorker = () =>
  import('/node_modules/@power-elements/service-worker/service-worker.js');

const upgradeGoodMap = () =>
  import('/bower_components/good-map/good-map.js');

installRouter(router);

attemptCatchUp();

requestIdleCallback(upgradeServiceWorker);
requestIdleCallback(upgradeGoodMap);
