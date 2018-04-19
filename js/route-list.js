import { fetchRestaurants, syncRestaurants } from './db/fetchRestaurants.js';
import { html, render } from '../node_modules/lit-html/lib/lit-extended.js';
import { onGoogleMapReady } from './map-marker.js';
import { uniqueCuisines, uniqueNeighbourhoods } from './restaurant-filters.js';
import { restaurantList } from './view-list.js';
import { $ } from './lib.js';

const goodMapList = ({ markers, restaurants }) => html`
<good-map id="map"
    api-key="AIzaSyD3E1D9b-Z7ekrT3tbhl_dy8DCXuIuDDRc"
    latitude="40.722216"
    longitude="-73.987501"
    zoom="12"
    map-options='{"scrollwheel": false, "backgroundColor": "transparent"}'
    on-google-map-ready="${ onGoogleMapReady({ markers, restaurants }) }">
</good-map>`;

const updateUi = restaurants => {
  const { value: cuisine = 'all' } = $('cuisines-select') || {};
  const cuisines = uniqueCuisines(restaurants);
  const { value: neighbourhood = 'all' } = $('neighbourhoods-select') || {};
  const neighbourhoods = uniqueNeighbourhoods(restaurants);
  render(html`<ul hidden></ul>`, $('#breadcrumb'));
  render(restaurantList({ cuisine, cuisines, neighbourhood, neighbourhoods, restaurants }), $('#app'));
  render(goodMapList({ restaurants }), $('#good-map'));
};

import { trace } from './lib.js';
const routeList = () => fetchRestaurants()
  .then(updateUi)
  .then(syncRestaurants)
  .then(trace('syncRestaurants'))
  .then(updateUi);

export default routeList;
