import { restaurantDetails } from './view-restaurant.js';
import { fetchRestaurantById, syncRestaurant } from './db/fetchRestaurantById.js';
import { fetchReviews, syncReviews } from './db/fetchReviews.js';
import { html, render } from '../node_modules/lit-html/lib/lit-extended.js';
import { onGoogleMapReady } from './map-marker.js';
import { $, getParameterByName } from './lib.js';

const breadcrumbTemplate = ({ name }) => html`
  <ul aria-label="Breadcrumb">
    <li><a href="/">Home</a></li>
    <li aria-current="page">${ name }</li>
  </ul>
`;

const scrollwheel = false;

const backgroundColor = "transparent";

const goodMapRestaurant = ({ markers, restaurant }) => {
  const { latlng: center } = restaurant || {};
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

const updateUi = ([restaurant, reviews] = []) => {
  const { markers } = window;
  const { name } = restaurant || {};

  render(breadcrumbTemplate({ name }), $('#breadcrumb'));
  render(restaurantDetails({ restaurant, reviews }), $('#app'));
  render(goodMapRestaurant({ markers, restaurant }), $('#good-map'));

  // continue the fluent promise flow
  return [restaurant, reviews];
};

/** Get restaurant and reviews over the network */
// syncs :: restaurant -> Promise<[restaurant, [review]]>
const syncs = ([{id}]) => !id ? Promise.resolve([]) : Promise.all([
  syncRestaurant(id),
  syncReviews(id)
]);

/** Get restaurant and reviews from cache */
// syncs :: restaurant -> Promise<[restaurant, [review]]>
const fetches = id => Promise.all([
  fetchRestaurantById(id),
  fetchReviews(id)
]);

const routeRestaurant = () => {
  const id = getParameterByName('id', location);
  return fetches(id)
    .then(updateUi)
    .then(syncs)
    .then(updateUi);
};

export default routeRestaurant;
