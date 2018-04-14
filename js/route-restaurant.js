import { restaurantDetails, reviewsListTemplate } from './restaurant-view.js';
import { fetchRestaurantById } from './db/fetchRestaurantById.js';
import { html, render } from '../node_modules/lit-html/lib/lit-extended.js';
import { mapContainer, onGoogleMapReady } from './map-marker.js';
import { renderAppend, getParameterByName } from './lib.js';

const restaurantId = getParameterByName('id', location);

const restaurantPromise = fetchRestaurantById(restaurantId);

const breadcrumbTemplate = ({ name }) => html`
  <ul aria-label="Breadcrumb">
    <li><a href="/">Home</a></li>
    <li aria-current="page">${ name }</li>
  </ul>
`;

const scrollwheel = false;
const backgroundColor = "transparent";

const goodMapRestaurant = ({ markers, restaurant }) => {
  const center = restaurant.latlng;
  const mapOptions = JSON.stringify({ scrollwheel, backgroundColor, center });
  const restaurants = [restaurant];
  return html`
    <good-map id="map"
        api-key="AIzaSyD3E1D9b-Z7ekrT3tbhl_dy8DCXuIuDDRc"
        zoom="12"
        map-options$="${mapOptions}"
        on-google-map-ready="${ onGoogleMapReady({ markers, restaurants }) }">
    </good-map>`;
};

const routeRestaurant = async ({ app }) => {
  const restaurant = await restaurantPromise;
  const { markers } = window;
  const { name } = restaurant;
  const appShell = document.getElementById('app-shell');

  render(breadcrumbTemplate({ name }), document.getElementById('breadcrumb'));
  renderAppend(restaurantDetails({ restaurant, restaurantId }), appShell, {prepend: true});
  render(reviewsListTemplate({ restaurant, restaurantId }), app);
  render(goodMapRestaurant({ markers, restaurant }), mapContainer);
};

export default routeRestaurant;
