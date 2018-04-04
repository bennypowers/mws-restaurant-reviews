import '../node_modules/@power-elements/emoji-rating/emoji-rating.js';
import '../node_modules/@power-elements/lazy-image/lazy-image.js';
import './restaurant-list.js';
import './restaurant-view.js';
import './review-card.js';
import './submit-review.js';
import OnlineMixin from './online-mixin.js';

import { LitElement, html } from '../node_modules/@polymer/lit-element/lit-element.js';

import { render } from '../node_modules/lit-html/lit-html.js';

import { until } from '../node_modules/lit-html/lib/until.js';

import { installRouter } from './router.js';

import { urlForRestaurant, imageUrlForRestaurant } from './map-marker.js';

import { fetchRestaurants, fetchRestaurantById, fetchReviews } from './dbhelper.js';
const restaurantsP = fetchRestaurants();

import {
  and,
  appendTemplateResult,
  compose,
  eq,
  getParameterByName,
  prop,
  trace,
  uniqueByKey,
} from './lib.js';

import styles from './styles.js';

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

const optionTemplate = (selected='all') => option =>
  html`<option value="${option}" selected="${selected === option}">${option}</option>`;

const renderHeader = restaurant =>
  render(headerTemplate(restaurant), document.getElementById('header'));

// TODO: general card element
const reviewCard = ({comments, createdAt, id, updatedAt, name, rating}) =>
  html`<review-card id="${ id }"
      comments="${ comments }"
      createdAt="${ createdAt }"
      updatedAt="${ updatedAt }"
      name="${ name }"
      rating="${ rating }"
  ></review-card>`;

const reviewsList = reviews =>
    !Array.isArray(reviews) ? html`There was a problem showing the reviews. Please try again.`
  : !reviews.length ? html`<p>No Reviews Yet!</p>`
  : reviews.map(reviewCard);

// "optimistic UI"
const onReviewSubmitted = component => event =>
  appendTemplateResult(
    component.shadowRoot.getElementById('restaurant'),
    reviewCard(event.detail)
  );

const restaurantCard = restaurant => html`<li>
  <restaurant-card id="${restaurant.id}"
      name="${restaurant.name}"
      address="${restaurant.address}"
      favourite="${restaurant.is_favorite}"
      image="${imageUrlForRestaurant(restaurant)}"
      url="${urlForRestaurant(restaurant)}"
      neighbourhood="${restaurant.neighbourhood}"></restaurant-card>
</li>`;

const restaurantCards = restaurants =>
    // case: bad input: display an error
    !Array.isArray(restaurants) ? html`There was a problem showing the restaurants. Please try again.`
    // case: no restaurants: tell the use that the filters exclude all options
  : !restaurants.length ? html`<li class="no-restaurants">No restaurants matching those filters</li>`
    // case: restaurants: return a list of restaurantCardTemplate
  : restaurants.map(restaurantCard);

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

class RestaurantReviews extends OnlineMixin(LitElement) {

  static get properties() {
    return {
      restaurantId: String,
      cuisine: String,
      neighbourhood: String,
      online: Boolean,
    };
  }

  constructor() {
    super();
    installRouter(async location => {
      if (location.pathname === '/') {
        this.restaurantId = '';
        renderHeader();
      } else {
        const restaurant = await fetchRestaurantById(getParameterByName('id', location));
        this.restaurantId = getParameterByName('id', location);
        this.restaurant = restaurant;
        renderHeader(restaurant);
      }
    });
  }

  render({ online, cuisine = 'all', neighbourhood = 'all', restaurantId = '' }) {

    const restaurantView = (restaurant = {}) => html`
      <restaurant-view id="restaurant"
          restaurant="${ restaurant }"
          on-review-submitted="${ onReviewSubmitted(this) }">
        ${ !restaurantId ? Promise.resolve([]) :
          fetchReviews(restaurantId)
            .then(reviewsList)
            .catch(trace('fetchReviews')) }
      </restaurant-view>
    `;

    const restaurantList = restaurants => html`${styles}
      <restaurant-list restaurants="${ restaurants }">
        <div slot="filters" class="filter-options">
          <select id="neighbourhoods-select"
              name="neighbourhoods"
              aria-label="Neighbourhoods"
              on-change="${ event => this.neighbourhood = event.target.value }">
            <option value="all">All Neighbourhoods</option>
            ${ uniqueNeighbourhoods(restaurants).map(optionTemplate(neighbourhood)) }
          </select>

          <select id="cuisines-select"
              name="cuisines"
              aria-label="Cuisines"
              on-change="${ event => this.cuisine = event.target.value }">
            <option value="all">All Cuisines</option>
            ${ uniqueCuisines(restaurants).map(optionTemplate(cuisine)) }
          </select>
        </div>
        ${ restaurantCards(restaurants.filter(byCuisineAndNeighbourhood(cuisine, neighbourhood))) }
      </restaurant-list>
    `;
    /* TODO: waiting for components to load before fetching is delaying paint.
             We should initiate fetch immediately on page load, and pass that
             data down to components
             While we're at it, we shouldn't be passing reference types as attributes
             only scalars. All reference types should be wrapped by their own
             component.
    */

    const restaurant = fetchRestaurantById(restaurantId)
      .then(restaurantView)
      .catch(trace('fetchRestaurantById'));

    const restaurants = restaurantsP
      .then(restaurantList)
      .catch(trace('fetchRestaurants'));

    return html`${ restaurantId
      ? until(restaurant, restaurantView())
      : until(restaurants, restaurantList([]))
    }`;
   }
}

customElements.define('restaurant-reviews', RestaurantReviews);
