import { fetchReviews } from './db/fetchReviews.js';
import { putFavorite } from './db/putFavorite.js';
import { renderAppend, placeholderImage, trim, trace } from './lib.js';
import { html } from '../node_modules/lit-html/lib/lit-extended.js';

import { imageUrlForRestaurant } from './map-marker.js';

import './review-card.js';

const upgradeElements = () => {
  Promise.all([
    import('./submit-review.js'),
    import('../node_modules/@power-elements/emoji-checkbox/emoji-checkbox.js'),
    import('../node_modules/@power-elements/power-fab/power-fab.js'),
  ]);
};

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
const onReviewSubmitted = event =>
  renderAppend(reviewCard(event.detail), document.getElementById('restaurant'));

// takes a string like "11:00 am - 5:00 pm" and returns semantic html
// str -> str
const formatOpeningToClosing = string =>
  string.split(' - ')
    .map(trim)
    .join(' - ');

const hoursRowTemplate = ([dayString, hoursString]) => html`
  <tr>
    <td><time>${dayString}</time></td>
    <td>${hoursString.split(', ').map(formatOpeningToClosing).join(', ')}</td>
  </tr>
`;

const hoursTemplate = hours =>
  Object.entries(hours || {})
    .map(hoursRowTemplate);

const onCheckedChanged = (restaurant = {}) => event =>
  restaurant.is_favorite != null &&
  event.detail.value != null &&
  event.detail.value !== restaurant.is_favorite &&
  putFavorite({
    restaurant_id: restaurant.id,
    is_favorite: event.detail.value
  });

const onActiveChanged = event =>
  document.querySelector('submit-review')
    .toggleOpened(event);

export const restaurantDetails = ({ restaurant = {} }) => html`
<section id="restaurant-container">
  <h1 id="restaurant-name" tabindex="0">
    ${restaurant.name}
    <emoji-checkbox
        full="😎"
        empty="💩"
        on-checked-changed="${ onCheckedChanged(restaurant) }"
        title="${restaurant.is_favorite ? 'Favourite!' : 'Not Favourite'}"
        checked?="${restaurant.is_favorite}"
        label="favourite"></emoji-checkbox>
  </h1>

  <figure id="restaurant-image-container">
    <lazy-image id="restaurant-image"
        src="${imageUrlForRestaurant(restaurant)}"
        alt="Interior or exterior of ${name}"
        placeholder="${placeholderImage}"
        rootMargin="40px"
        fade></lazy-image>
    <figcaption id="restaurant-cuisine">${restaurant.cuisine_type}</figcaption>
  </figure>

  <div id="restaurant-details-container">
    <address id="restaurant-address"
        tabindex="0"
        aria-label="Address">${restaurant.address}</address>
    <table id="restaurant-hours"
        tabindex="0"
        aria-label="Hours">${hoursTemplate(restaurant.operating_hours)}</table>
  </div>
</section>
`;

export const reviewsListTemplate = ({ restaurantId, restaurant = {} }) => html`
<section id="reviews-container" tabindex="0" aria-label="Reviews">
  <h2>Reviews</h2>
  <div id="reviews-list">${
    fetchReviews(restaurantId)
      .then(reviewsList)
      .catch(trace('fetchReviews'))
  }
  </div>
</section>

<power-fab id="form-fab"
    label="+"
    title="Add Review"
    on-active-changed="${ onActiveChanged }"></power-fab>

<submit-review id="review-fab"
    restaurantId="${restaurant.id}"
    on-review-submitted="${ onReviewSubmitted }"></submit-review>
`;

requestIdleCallback(upgradeElements);
