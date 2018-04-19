import { fetchRestaurants } from './db/fetchRestaurants.js';
import { addMarkers } from './map-marker.js';
import { byCuisineAndNeighbourhood, uniqueCuisines, uniqueNeighbourhoods } from './restaurant-filters.js';
import { html, render } from '../node_modules/lit-html/lib/lit-extended.js';
import { urlForRestaurant, imageUrlForRestaurant } from './map-marker.js';
import { $ } from './lib.js';

const onSelect = async () => {
  const { map } = $('#map');
  const { markers } = window;

  const allRestaurants = await fetchRestaurants();
  const neighbourhoods = uniqueNeighbourhoods(allRestaurants);
  const { value: neighbourhood = 'all' } = $('#neighbourhoods-select') || {};
  const cuisines = uniqueCuisines(allRestaurants);
  const { value: cuisine = 'all' } = $('#cuisines-select') || {};

  const restaurants = allRestaurants
    .filter( byCuisineAndNeighbourhood(cuisine, neighbourhood) );

  addMarkers({ map, restaurants, markers });

  render(restaurantList({
    cuisine,
    cuisines,
    neighbourhood,
    neighbourhoods,
    restaurants,
  }), $('#app'));
};

const noRestaurants = html`<li class="no-restaurants">No restaurants matching those filters</li>`;

const errorRestaurants = html`There was a problem showing the restaurants. Please try again.`;

const restaurantCard = restaurant => html`
  <li>
    <restaurant-card id="${restaurant.id}"
        name="${restaurant.name}"
        address="${restaurant.address}"
        favourite="${restaurant.is_favorite}"
        image="${ imageUrlForRestaurant(restaurant) }"
        url="${ urlForRestaurant(restaurant) }"
        neighbourhood="${restaurant.neighbourhood}"></restaurant-card>
  </li>`;

const optionTemplate = (selected='all') => option => html`
  <option value="${option}" selected="${selected === option}">${option}</option>`;

const restaurantItems = restaurants =>
    // case: bad input: display an error
    !Array.isArray(restaurants) ? errorRestaurants
    // case: no restaurants: tell the use that the filters exclude all options
  : !restaurants.length ? noRestaurants
    // case: restaurants: return a list of restaurantCardTemplate
  : restaurants.map(restaurantCard);

export const restaurantList = ({
  cuisine,
  cuisines,
  neighbourhood,
  neighbourhoods,
  restaurants,
}) => html`
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
      ${ neighbourhoods.map( optionTemplate(neighbourhood) ) }
    </select>

    <select id="cuisines-select"
        name="cuisines"
        aria-label="Cuisines"
        on-change="${ onSelect }">
      <option value="all">All Cuisines</option>
      ${ cuisines.map( optionTemplate(cuisine) ) }
    </select>
  </div>

  <ul id="restaurants-list">
    ${ restaurantItems(restaurants) }
  </ul>`;
