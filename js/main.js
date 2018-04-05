import { getParameterByName } from './lib.js';
import { attemptCatchUp } from './db/cacheRequest.js';
import { fetchRestaurantById } from './db/fetchRestaurantById.js';
import { fetchRestaurants } from './db/fetchRestaurants.js';
import { html, render } from '../node_modules/lit-html/lib/lit-extended.js';
import { installRouter } from './router.js';
import { addMarkers } from './map-marker.js';
import { uniqueCuisines, uniqueNeighbourhoods } from './restaurant-filters.js';

const breadcrumbTemplate = ({ name }) => html`
  <ul id="breadcrumb" aria-label="Breadcrumb">
    <li><a href="/">Home</a></li>
    <li aria-current="page">${ name }</li>
  </ul>
`;

const headerTemplate = restaurant => html`
<link rel="stylesheet" href="${ restaurant ? '/css/restaurant.css' : '' }">
  <nav>
    <h1><a href="/">Restaurant Reviews</a></h1>
    ${ restaurant ? breadcrumbTemplate(restaurant) : '' }
  </nav>
`;

const renderHeader = restaurant =>
  render(headerTemplate(restaurant), document.getElementById('header'));

const app = document.getElementById('app');
const mapContainer = document.getElementById('good-map');

const swapMaps = () => {
  const goodMap = document.getElementById('good-map');
        goodMap.style.opacity = 1;
};

const onGoogleMapReady = ({ markers, restaurants }) => event => (
  requestIdleCallback(swapMaps),
  addMarkers({ map: event.detail, restaurants, markers })
);

const goodMapList = ({ markers, restaurants }) => html`
<good-map id="map"
    api-key="AIzaSyD3E1D9b-Z7ekrT3tbhl_dy8DCXuIuDDRc"
    latitude="40.722216"
    longitude="-73.987501"
    zoom="12"
    map-options='{"scrollwheel": false}'
    on-google-map-ready="${ onGoogleMapReady({ markers, restaurants }) }">
</good-map>`;

export const routeList = async () => {
  const { restaurantList } = await import('./restaurant-list.js');
  const restaurants = await fetchRestaurants();
  const online = navigator.onLine;
  const neighbourhoods = uniqueNeighbourhoods(restaurants);
  const neighbourhood = (document.getElementById('neighbourhoods-select') || {}).value || 'all';
  const cuisines = uniqueCuisines(restaurants);
  const cuisine = (document.getElementById('cuisines-select') || {}).value || 'all';

  renderHeader();
  render(restaurantList({ online, cuisine, cuisines, neighbourhood, neighbourhoods, restaurants }), app);
  render(goodMapList({ restaurants }), mapContainer);
};

const routeRestaurant = async () => {
  const [restaurantView] = await Promise.all([
    import('./restaurant-view.js'),
  ]);

  const restaurantId = getParameterByName('id', location);
  const restaurant = await fetchRestaurantById(restaurantId);
  const restaurants = [restaurant];
  const { markers } = window;
  const { map } = document.getElementById('map') || {};
  const online = navigator.onLine;

  addMarkers({ map, restaurants, markers });

  renderHeader(restaurant);
  render(restaurantView({ online, restaurantId }), app);
};

const router = async location =>
  location.pathname === '/' ? routeList() : routeRestaurant();

installRouter(router);

attemptCatchUp();

const upgradeServiceWorker = () =>
  import('/node_modules/@power-elements/service-worker/service-worker.js');

const upgradeGoodMap = () => import('/bower_components/good-map/good-map.js');

requestIdleCallback(upgradeServiceWorker);
requestIdleCallback(upgradeGoodMap);
