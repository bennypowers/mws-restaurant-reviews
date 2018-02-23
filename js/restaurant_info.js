import { traceError } from './log.js';
import { nameToId } from './string.js';
import { titleMap } from './maphelper.js';
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

  titleMap(map, `Map to ${restaurant.name || 'Restaurant'}`);

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
  if (restaurant.operating_hours) fillRestaurantHoursHTML();

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
        title.tabIndex = 0;
  container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement('p');
          noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }

  const div = document.getElementById('reviews-list');
  reviews.forEach(review => div.appendChild(createReviewHTML(review)));
  container.appendChild(div);
};

/**
 * Create review HTML and add it to the webpage.
 */
export const createReviewHTML = ({comments, date, name, rating}) => {
  const article = document.createElement('article');
  const header = document.createElement('header');
  const id = nameToId(name);

  const h1 = document.createElement('h1');
        h1.innerHTML = name;
        h1.tabIndex = 0;
        // NOTE: We opt to use h1 in restaurant and review listings, since h1 is
        //       allowed and prefered by the outline algorithm. However, since
        //       UAs don't implement outline, we assist users by using the
        //       aria-labelledby attribute to explicitly link h1s to their sections.
        h1.id = id;
  header.appendChild(h1);

  const time = document.createElement('time');
        time.innerHTML = date;
  header.appendChild(time);

  article.appendChild(header);
  article.setAttribute('aria-labelledby', id);

  const meter = document.createElement('meter');
        meter.min = 0;
        meter.max = 5;
        meter.low = 2;
        meter.high = 4;
        meter.value = rating;
        meter.optimum = 5;
  const span = document.createElement('span');
        span.innerHTML = 'Rating: ';
        span.appendChild(meter);
  article.appendChild(span);

  const p = document.createElement('p');
        p.innerHTML = comments;
  article.appendChild(p);

  return article;
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
