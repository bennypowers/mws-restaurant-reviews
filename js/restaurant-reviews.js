import '/node_modules/@power-elements/emoji-rating/emoji-rating.js';
import '/node_modules/@power-elements/lazy-image/lazy-image.js';
import './restaurant-list.js';
import './restaurant-view.js';
import './review-card.js';
import './submit-review.js';

import { LitElement, html } from '/node_modules/@polymer/lit-element/lit-element.js';

import { render } from '/node_modules/lit-html/lit-html.js';

import { until } from '/node_modules/lit-html/lib/until.js';

import { installRouter } from './router.js';

import { fetchRestaurants, fetchRestaurantById, fetchReviews } from './dbhelper.js';

import { getParameterByName } from './lib.js';

const breadcrumbTemplate = ({name}) => html`
  <ul id="breadcrumb" aria-label="Breadcrumb">
    <li><a href="/">Home</a></li>
    <li aria-current="page">${name}</li>
  </ul>
`;

const headerTemplate = restaurant => html`
  <link rel="stylesheet" href="${restaurant ? '/css/restaurant.css' : ''}">
  <nav>
    <h1><a href="/">Restaurant Reviews</a></h1>
    ${restaurant ? breadcrumbTemplate(restaurant) : ''}
  </nav>
`;

const renderHeader = restaurant =>
  render(headerTemplate(restaurant), document.getElementById('header'));

// TODO: general card element
const reviewCard = ({comments, createdAt, updatedAt, name, rating}) => html`
  <review-card
      comments="${comments}"
      createdAt="${createdAt}"
      updatedAt="${updatedAt}"
      name="${name}"
      rating="${rating}"
  ></review-card>`;

const reviewsList = reviews =>
    !Array.isArray(reviews) ? html`There was a problem showing the reviews. Please try again.`
  : !reviews.length ? html`<p>No Reviews Yet!</p>`
  : reviews.map(reviewCard);


export default class RestaurantReviews extends LitElement {

  static get properties() {
    return {
      restaurantId: String,
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

  onReviewSubmitted(event) {
    // TODO: unbreak my heart
    // "optimistic UI"
    // this.reviews = Promise.resolve([...Promise.resolve(this.reviews), event.detail]);
    // real data from the server
    // this.reviews = fetchReviews(this.restaurantId).then(reviewsList);
  }

  render({restaurantId = ''}) {
    const restaurantView = (restaurant = {}) => html`
      <restaurant-view restaurant="${restaurant}" on-review-submitted="${this.onReviewSubmitted}">
        ${restaurantId ? fetchReviews(restaurantId).then(reviewsList) : Promise.resolve([])}
      </restaurant-view>
    `;

    const restaurantList = restaurants => html`
      <restaurant-list restaurants="${restaurants}"></restaurant-list>
    `;

    const restaurant = fetchRestaurantById(restaurantId).then(restaurantView);
    const restaurants = fetchRestaurants().then(restaurantList);

    return restaurantId
      ? html`${until(restaurant, restaurantView())}`
      : html`${until(restaurants, restaurantList([]))}`;
  }
}

customElements.define('restaurant-reviews', RestaurantReviews);
