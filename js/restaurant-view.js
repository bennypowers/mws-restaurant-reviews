import { fetchReviews } from './db/fetchReviews.js';
import { putFavorite } from './db/putFavorite.js';
import { renderAppend, placeholderImage, trim, trace } from './lib.js';
import { html } from '../node_modules/lit-html/lib/lit-extended.js';
import getDay from '../node_modules/date-fns/esm/getDay/index.js';
import { imageUrlForRestaurant } from './map-marker.js';

import './review-card.js';

const upgradeElements = () => {
  Promise.all([
    import('./submit-review.js'),
    import('../node_modules/@power-elements/emoji-checkbox/emoji-checkbox.js'),
    import('../node_modules/@power-elements/power-fab/power-fab.js'),
  ]);
};

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

const days = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const isToday = dayString => {
  const today = days[getDay(Date.now())];
  return (dayString.toLowerCase() == today.toLowerCase());
};

const hoursRowTemplate = ([dayString, hoursString]) => {
  const today = isToday(dayString);
  return html`
  <tr class$="${today ? 'today' : ''}">
    <td><time>${today ? 'Today' : dayString}</time></td>
    <td>${hoursString.split(', ').map(formatOpeningToClosing).join(', ')}</td>
  </tr>`;
};

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

export const hoursAddressTemplate = ({ address, operating_hours }) => html`
  <address id="restaurant-address"
      tabindex="0"
      aria-label="Address">${address}</address>
  <table id="restaurant-hours"
      tabindex="0"
      aria-label="Hours">${hoursTemplate(operating_hours)}</table> `;

export const mapImageTemplate = restaurant => html`
<figure id="restaurant-image-container">
  <lazy-image id="restaurant-image"
      src="${imageUrlForRestaurant(restaurant)}"
      alt="Interior or exterior of ${name}"
      placeholder="${placeholderImage}"
      rootMargin="40px"
      fade></lazy-image>
  <figcaption id="restaurant-info">
    <h2 id="restaurant-name" tabindex="0">${restaurant.name}</h2>
    <h3 id="restaurant-cuisine">${restaurant.cuisine_type}</h3>
    <emoji-checkbox id="favourite-checkbox"
        label="favourite"
        title="${restaurant.is_favorite ? 'Favourite!' : 'Not Favourite'}"
        full="😎" empty="💩"
        checked?="${restaurant.is_favorite}"
        on-checked-changed="${ onCheckedChanged(restaurant) }"
    ></emoji-checkbox>
  </figcaption>
</figure>`;

export const reviewsListTemplate = ({ restaurantId, restaurant = {} }) => {
  const reviews = fetchReviews(restaurantId)
    .then(reviewsList)
    .catch(trace('fetchReviews'));

  return html`
  <h2>Reviews</h2>
  <div id="reviews-list">${ reviews }</div>

  <power-fab id="form-fab"
      label="+"
      title="Add Review"
      on-active-changed="${ onActiveChanged }"></power-fab>

  <submit-review id="review-fab"
      restaurantId="${restaurant.id}"
      on-review-submitted="${ onReviewSubmitted }"></submit-review>`;
};

export const restaurantDetails = ({ restaurant = {} }) => html`
<section id="restaurant-container">${mapImageTemplate(restaurant)}</section>
<section id="restaurant-details-container">${hoursAddressTemplate(restaurant)}</section>
<section id="reviews-container" tabindex="0" aria-label="Reviews">${reviewsListTemplate({ restaurantId: restaurant.id, restaurant })}</section>
`;

requestIdleCallback(upgradeElements);
