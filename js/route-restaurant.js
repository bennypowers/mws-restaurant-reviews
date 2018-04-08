import { fetchRestaurantById } from './db/fetchRestaurantById.js';
import { html, render } from '../node_modules/lit-html/lib/lit-extended.js';
import { addMarkers } from './map-marker.js';
import { getParameterByName } from './lib.js';

const restaurantId = getParameterByName('id', location);

const breadcrumbTemplate = ({ name }) => html`
  <ul aria-label="Breadcrumb">
    <li><a href="/">Home</a></li>
    <li aria-current="page">${ name }</li>
  </ul>
`;

const routeRestaurant = async ({ app }) => {
  // Concurrent requests
  const [restaurantView, restaurant] = await Promise.all([
    import('./restaurant-view.js'),
    fetchRestaurantById(restaurantId),
  ]);

  const restaurants = [restaurant];
  const { markers } = window;
  const { map } = document.getElementById('map') || {};
  const { name } = restaurant;
  const online = navigator.onLine;

  addMarkers({ map, restaurants, markers });

  render(breadcrumbTemplate({ name }), document.getElementById('breadcrumb'));
  render(restaurantView({ online, restaurantId }), app);
};

export default routeRestaurant;
