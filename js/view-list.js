import './restaurant-card.js';

import { addMarkers } from './map-marker.js';
import { byCuisineAndNeighbourhood, uniqueCuisines, uniqueNeighbourhoods } from './restaurant-filters.js';
import { fetchRestaurants } from './db/fetchRestaurants.js';
import { html, render } from '../node_modules/lit-html/lib/lit-extended.js';
import { urlForRestaurant, imageUrlForRestaurant } from './map-marker.js';

const app = document.getElementById('app');

const onSelect = async () => {
  // fetchRestaurants is cached in idb so it's cheap to await it on render.
  const allRestaurants = await fetchRestaurants();
  const neighbourhoods = uniqueNeighbourhoods(allRestaurants);
  const neighbourhood = document.getElementById('neighbourhoods-select').value;
  const cuisines = uniqueCuisines(allRestaurants);
  const cuisine = document.getElementById('cuisines-select').value;
  const { map } = document.getElementById('map');
  const { markers } = window;

  const restaurants = allRestaurants
    .filter(byCuisineAndNeighbourhood(cuisine, neighbourhood));

  const template = restaurantList({ restaurants, cuisine, cuisines, neighbourhoods, neighbourhood });

  addMarkers({map, restaurants, markers});

  return render(template, app);
};

const noRestaurants = html`<li class="no-restaurants">No restaurants matching those filters</li>`;

const errorRestaurants = html`There was a problem showing the restaurants. Please try again.`;

const restaurantCard = restaurant => html`<li>
  <restaurant-card id="${restaurant.id}"
      name="${restaurant.name}"
      address="${restaurant.address}"
      favourite="${restaurant.is_favorite}"
      image="${ imageUrlForRestaurant(restaurant) }"
      url="${ urlForRestaurant(restaurant) }"
      neighbourhood="${restaurant.neighbourhood}"></restaurant-card>
</li>`;

const optionTemplate = (selected='all') => option =>
  html`<option value="${option}" selected="${selected === option}">${option}</option>`;

const restaurantItems = restaurants =>
    // case: bad input: display an error
    !Array.isArray(restaurants) ? errorRestaurants
    // case: no restaurants: tell the use that the filters exclude all options
  : !restaurants.length ? noRestaurants
    // case: restaurants: return a list of restaurantCardTemplate
  : restaurants.map(restaurantCard);

export const restaurantList = ({ restaurants, cuisine, cuisines, neighbourhoods, neighbourhood }) => {

  return html`
    <div id="map-container">
      <div id="good-map"></div>
    </div>

    <div class="filter-options">
      <h2>Filter Results</h2>

      <select id="neighbourhoods-select"
          name="neighbourhoods"
          aria-label="Neighbourhoods"
          on-change="${ onSelect }">
        <option value="all">All Neighbourhoods</option>
        ${ neighbourhoods.map(optionTemplate(neighbourhood)) }
      </select>

      <select id="cuisines-select"
          name="cuisines"
          aria-label="Cuisines"
          on-change="${ onSelect }">
        <option value="all">All Cuisines</option>
        ${ cuisines.map(optionTemplate(cuisine)) }
      </select>
    </div>

    <ul id="restaurants-list">
      ${ restaurantItems(restaurants) }
    </ul>
  `;
};
