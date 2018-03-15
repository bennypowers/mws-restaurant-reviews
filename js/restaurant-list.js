import './restaurant-card.js';

import { LitElement, html } from '/node_modules/@polymer/lit-element/lit-element.js';

import { and, compose, eq, prop, uniqueByKey } from './lib.js';

import { mapMarker, urlForRestaurant, imageUrlForRestaurant } from './map-marker.js';

import styles from './styles.js';

const restaurantCard = restaurant => html`
<li>
  <restaurant-card
      name="${restaurant.name}"
      address="${restaurant.address}"
      favourite="${restaurant.is_favorite}"
      image="${imageUrlForRestaurant(restaurant)}"
      url="${urlForRestaurant(restaurant)}"
      neighbourhood="${restaurant.neighbourhood}"></restaurant-card>
</li>
`;

const restaurantCards = restaurants =>
    // case: bad input: display an error
    !Array.isArray(restaurants) ? html`There was a problem showing the restaurants. Please try again.`
    // case: no restaurants: tell the use that the filters exclude all options
  : !restaurants.length ? html`<li class="no-restaurants">No restaurants matching those filters</li>`
    // case: restaurants: return a list of restaurantCardTemplate
  : restaurants.map(restaurantCard);

const optionTemplate = (selected='all') => option => html`
  <option value="${option}" selected="${selected === option}">${option}</option>
`;

// uniqueNeighbourhoods :: o -> ks
export const uniqueNeighbourhoods = uniqueByKey('neighbourhood');

// uniqueCuisines :: o -> ks
export const uniqueCuisines = uniqueByKey('cuisine_type');

/** Predicate the filters by cuisine, neighbourhood, or both. */
// byCuisineAndNeighbourhood :: (s, s) -> f
export const byCuisineAndNeighbourhood = (cuisine='all', neighbourhood='all') => {
  const filterCuisine = compose(eq(cuisine), prop('cuisine_type'));
  const filterNeighbourhood = compose(eq(neighbourhood), prop('neighbourhood'));
  return (
      cuisine != 'all' && neighbourhood != 'all' ? and(filterCuisine, filterNeighbourhood)
    : cuisine != 'all' ? filterCuisine
    : neighbourhood != 'all' ? filterNeighbourhood
    : x => x
  );
};

class RestaurantList extends LitElement {

  static get properties() {
    return {
      restaurants: Array,
      neighbourhood: String,
      cuisine: String,
    };
  }

  addMarkers({map, restaurants = [], markers = []}) {
    if (!window.google) return;
    markers.forEach(m => m.setMap(null));
    this.markers = restaurants.map(mapMarker(map));
  }

  render({restaurants = [], cuisine = 'all', neighbourhood = 'all'}) {

    const allNeighbourhoods = uniqueNeighbourhoods(restaurants);
    const allCuisines = uniqueCuisines(restaurants);

    restaurants = restaurants.filter(byCuisineAndNeighbourhood(cuisine, neighbourhood));

    const { map } = this.shadowRoot.querySelector('good-map') || {};
    const { markers } = this;
    this.addMarkers({map, restaurants, markers});

    return html`
      ${styles}
      <main id="maincontent">
        <section name="restaurants">
          <div id="map-container">
            <good-map id="map"
                api-key="AIzaSyD3E1D9b-Z7ekrT3tbhl_dy8DCXuIuDDRc"
                latitude="40.722216"
                longitude="-73.987501"
                zoom="12"
                map-options='{"scrollwheel": false}'
                on-google-map-ready="${event => this.addMarkers({map: event.detail, restaurants, markers: this.markers})}">
            </good-map>
          </div>
          <section>
            <div class="filter-options">
              <h2>Filter Results</h2>

              <select id="neighbourhoods-select"
                  name="neighbourhoods"
                  aria-label="Neighbourhoods"
                  on-change="${event => this.neighbourhood = event.target.value}">
                <option value="all">All Neighbourhoods</option>
                ${allNeighbourhoods.map(optionTemplate(neighbourhood))}
              </select>

              <select id="cuisines-select"
                  name="cuisines"
                  aria-label="Cuisines"
                  on-change="${event => this.cuisine = event.target.value}">
                <option value="all">All Cuisines</option>
                ${allCuisines.map(optionTemplate(cuisine))}
              </select>

            </div>

            <ul id="restaurants-list">
              ${restaurantCards(restaurants)}
            </ul>

          </section>
        </section>
      </main>`;
    }
  }

customElements.define('restaurant-list', RestaurantList);
