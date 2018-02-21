import { trace, traceError } from './log.js';
import DBHelper from './dbhelper.js';

window.restaurant = window.restaurant || undefined;
window.map = window.map || undefined;

// str -> html | str
const formatTimeString = time =>
  time.match(/(([01]?[0-9]):[0-5][0-9]) [AaPp][Mm]/)
    ? `<time>${time}</time>`
    : time;

// str -> str
const trim = str => str.trim();

// takes a string like "11:00 am - 5:00 pm" and returns semantic html
// str -> str
const formatOpeningToClosing = string =>
  string.split(' - ')
    .map(formatTimeString)
    .map(trim)
    .join(' - ');

const setRestaurantReference = restaurant =>
  (self.restaurant = restaurant, restaurant);

const fillMapForRestaurant = restaurant => {
  const zoom = 16;
  const center = restaurant.latlng;
  const scrollwheel = false;
  const mapEl = document.getElementById('map');
  const map = new google.maps.Map(mapEl, { center, scrollwheel, zoom });

  self.map = map;

  DBHelper.mapMarkerForRestaurant(restaurant, map);

  return restaurant;
};

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  const id = getParameterByName('id');
  fetchRestaurantFromURL(id)
    // .then(trace('fetchRestaurantFromURL in initMap'))
    .then(setRestaurantReference)
    .then(fillRestaurantHTML)
    .then(fillMapForRestaurant)
    .then(fillBreadcrumb)
    .catch(traceError('fetchRestaurantFromURL'));
};

/**
 * Get current restaurant from page URL.
 */
export const fetchRestaurantFromURL = id => {
  // use of parens aids in tabulating ternary without running afoul of ASI.
  return (
      !id ? Promise.reject(new Error('No restaurant id in URL'))  // no id found in URL
    : self.restaurant ? Promise.resolve(self.restaurant)             // restaurant already fetched!
    : DBHelper.fetchRestaurantById(id)
  );
};

/**
 * Create restaurant HTML and add it to the webpage
 */
export const fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img';
  image.src = DBHelper.imageUrlForRestaurant(restaurant);

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  fillReviewsHTML();

  return restaurant;
};

// element -> object -> element
const impureOutputHoursHTML = table =>
  ([dayString, hoursString]) => {
    const times = hoursString
      .split(', ')
      .map(formatOpeningToClosing)
      .join(', ');

    const day = document.createElement('td');
          day.innerHTML = `<time>${dayString}</time>`;

    const time = document.createElement('td');
          time.innerHTML = times;

    const row = document.createElement('tr');
          row.appendChild(day);
          row.appendChild(time);

    return table.appendChild(row);
  };

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
export const fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hoursTable = document.getElementById('restaurant-hours');
  Object.entries(operatingHours)
    .forEach(impureOutputHoursHTML(hoursTable));
};

/**
 * Create all reviews HTML and add them to the webpage.
 */
export const fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h2');
  title.innerHTML = 'Reviews';
  container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }

  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
};

/**
 * Create review HTML and add it to the webpage.
 */
export const createReviewHTML = (review) => {
  const li = document.createElement('li');
  const header = document.createElement('header');
  li.appendChild(header);

  const name = document.createElement('h1');
  name.innerHTML = review.name;
  header.appendChild(name);

  const date = document.createElement('time');
  date.innerHTML = review.date;
  header.appendChild(date);

  const rating = document.createElement('span');
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
};

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
export const fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
  return restaurant;
};

/**
 * Get a parameter by name from page URL.
 */
export const getParameterByName = (name, urlString) =>
  // URL constructor obviates need to parse urls ourselves.
  (new URL(urlString || window.location.href))
    .searchParams
    .get(name);
