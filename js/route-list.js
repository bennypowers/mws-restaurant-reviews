import { fetchRestaurants } from './db/fetchRestaurants.js';
import { html, render } from '../node_modules/lit-html/lib/lit-extended.js';
import { addMarkers } from './map-marker.js';
import { uniqueCuisines, uniqueNeighbourhoods } from './restaurant-filters.js';
import { restaurantList } from './restaurant-list.js';

const cuisineSelect = document.getElementById('cuisines-select') || {};
const neighbourhoodSelect = document.getElementById('neighbourhoods-select') || {};
const mapContainer = document.getElementById('good-map');

const swapMaps = () => mapContainer.style.opacity = 1;

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
    map-options='{"scrollwheel": false, "backgroundColor": "transparent"}'
    on-google-map-ready="${ onGoogleMapReady({ markers, restaurants }) }">
</good-map>`;

const routeList = async ({ app }) => {
  // Concurrent Requests.
  const restaurants = await fetchRestaurants();

  const online = navigator.onLine;

  const cuisines = uniqueCuisines(restaurants);
  const neighbourhoods = uniqueNeighbourhoods(restaurants);

  const cuisine = cuisineSelect.value || 'all';
  const neighbourhood = neighbourhoodSelect.value || 'all';

  render(restaurantList({ online, cuisine, cuisines, neighbourhood, neighbourhoods, restaurants }), app);
  render(goodMapList({ restaurants }), mapContainer);
};

export default routeList;
