import { putFavorite } from './db/putFavorite.js';
import { fetchRestaurantById } from './db/fetchRestaurantById.js';
import { fetchReviews } from './db/fetchReviews.js';
import { $, byCreatedAtDesc, placeholderImage, trim } from './lib.js';
import { html, render } from '../node_modules/lit-html/lib/lit-extended.js';
import { imageUrlForRestaurant } from './map-marker.js';
import { addDays, isWithinInterval, parse } from './date-fns.min.js';

const intervalSeparator = ', ';
const hoursSeparator = ' - ';

const upgradeElements = () => {
  Promise.all([
    import('./submit-review.js'),
    import('../node_modules/@power-elements/emoji-checkbox/emoji-checkbox.js'),
    import('../node_modules/@power-elements/power-fab/power-fab.js'),
  ]);
};

// "optimistic UI"
const onReviewSubmitted = restaurantId => async () => {
  const reviewsP = fetchReviews(restaurantId);
  const restaurantP = fetchRestaurantById(restaurantId);
  const [restaurant, reviews] = await Promise.all([restaurantP, reviewsP]);
  return render(restaurantDetails({ restaurant, reviews }), $('#app'));
};

// takes a string like "11:00 am - 5:00 pm" and returns semantic html
// str -> str
const formatOpeningToClosing = string =>
  string.split(hoursSeparator)
    .map(trim)
    .join(hoursSeparator);

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
  const today = days[ ( new Date() ).getDay() ];
  return dayString.toLowerCase() == today.toLowerCase();
};

const openTemplate = open => html`
  <div id="open-now" class$="${ open ? 'open' : 'closed' }">
    <strong>${ open ? 'Open Now!' : 'Now Closed' }</strong>
  </div>
`;

const isOpenInInterval = date => interval => {
  const [opening, closing] = interval.split(hoursSeparator);
  const start = parse(opening, 'h:mm a', date);
  const endProvisional = parse(closing, 'h:mm a', date);
  const endHour = endProvisional.getHours() || 24;
  const startHour = start.getHours() || 0;
  const openAfterMidnight = endHour === 24 || startHour > endHour;
  const end =
      !openAfterMidnight ? endProvisional
    : addDays(endProvisional, 1);

  return isWithinInterval(date, { start, end });
};

const all = (a, b) => a && b;

const openNow = openingHours => {
  if (!openingHours) return;
  const date = new Date();
  const todaysHours = openingHours[ days[ date.getDay() ] ];

  return todaysHours
    .split(intervalSeparator)
    .map( isOpenInInterval(date) )
    .reduce(all, true);
};

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

const reviewCard = ({comments, createdAt, id, updatedAt, name, rating}) => html`
  <review-card id="review-${ id }"
      comments="${ comments }"
      createdAt="${ createdAt }"
      updatedAt="${ updatedAt }"
      name="${ name }"
      rating="${ rating }"
  ></review-card>`;

const reviewsList = reviews =>
    !Array.isArray(reviews) ? html`There was a problem showing the reviews. Please try again.`
  : !reviews.length ? html`<p>No Reviews Yet!</p>`
  : reviews
    .sort(byCreatedAtDesc)
    .map(reviewCard);

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

export const hoursAddressTemplate = ({ address, operating_hours }) => html`
  <section id="restaurant-address-open">
    <address id="restaurant-address" tabindex="0" aria-label="Address">${address}</address>
    ${ openNow(operating_hours) }
  </section>
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
        fade
    ></lazy-image>
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

export const reviewsListTemplate = ({ reviews, restaurant = {} }) => html`
  <h2>Reviews</h2>
  <div id="reviews-list">${ reviewsList(reviews) }</div>

  <power-fab id="form-fab"
      label="+"
      title="Add Review"
      on-active-changed="${ onActiveChanged }"></power-fab>

  <submit-review id="review-fab"
      restaurantId="${restaurant.id}"
      on-review-submitted="${ onReviewSubmitted(restaurant.id) }"></submit-review>`;

export const restaurantDetails = ({ reviews = [], restaurant = {} }) => html`
  <div id="map-container">
    <div id="good-map"></div>
  </div>
  <section id="restaurant-container">${restaurant && mapImageTemplate(restaurant)}</section>
  <section id="restaurant-details">${restaurant && hoursAddressTemplate(restaurant)}</section>
  <section id="reviews-container" tabindex="0" aria-label="Reviews">${reviews.length && reviewsListTemplate({ reviews, restaurant })}</section>`;

requestIdleCallback(upgradeElements);
