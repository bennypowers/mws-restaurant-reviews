import { installRouter } from './router.js';

import { fetchRestaurants, fetchRestaurantById, fetchReviews } from './dbhelper.js';

import { LitElement, html } from '/node_modules/@polymer/lit-element/lit-element.js';

import { render } from '/node_modules/lit-html/lit-html.js';

import { until } from '/node_modules/lit-html/lib/until.js';

import './lazyImage.js';
import '/js/submitReview.js';
import '/node_modules/@power-elements/emoji-rating/emoji-rating.js';

import { filter, map, trace } from './lib.js';

import formatDistance from '/node_modules/date-fns/esm/formatDistance/index.js';

import {
  and,
  compose,
  eq,
  getParameterByName,
  nameToId,
  prop,
  trim,
  uniqueByKey,
} from './lib.js';

import styles from './styles.js';

import restaurantStyles from './restaurantStyles.js';

const placeholderImage = 'data:image/svg;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%3E%0D%0A%20%20%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%0D%0A%20%20%20%20%3Cpath%20fill%3D%22%23000%22%20fill-rule%3D%22nonzero%22%20d%3D%22M11%2C9%20L9%2C9%20L9%2C2%20L7%2C2%20L7%2C9%20L5%2C9%20L5%2C2%20L3%2C2%20L3%2C9%20C3%2C11.12%204.66%2C12.84%206.75%2C12.97%20L6.75%2C22%20L9.25%2C22%20L9.25%2C12.97%20C11.34%2C12.84%2013%2C11.12%2013%2C9%20L13%2C2%20L11%2C2%20L11%2C9%20Z%20M16%2C6%20L16%2C14%20L18.5%2C14%20L18.5%2C22%20L21%2C22%20L21%2C2%20C18.24%2C2%2016%2C4.24%2016%2C6%20Z%22%2F%3E%0D%0A%20%20%20%20%3Cpolygon%20points%3D%220%200%2024%200%2024%2024%200%2024%22%2F%3E%0D%0A%20%20%3C%2Fg%3E%0D%0A%3C%2Fsvg%3E';

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

/** Restaurant page URL. */
// urlForRestaurant :: str -> str
const urlForRestaurant = ({id}) =>
  `/restaurant?id=${id}`;

// takes a string like "11:00 am - 5:00 pm" and returns semantic html
// str -> str
const formatOpeningToClosing = string =>
  string.split(' - ')
    .map(trim)
    .join(' - ');

const mapMarker = map => restaurant => (
  new google.maps.Marker({
        animation: google.maps.Animation.DROP,
        position: restaurant.latlng,
        title: restaurant.name,
        url: urlForRestaurant(restaurant),
        map,
  }).addListener('click', event => window.location = urlForRestaurant(restaurant))
);

const optionTemplate = (selected='all') => option => html`
  <option value="${option}" selected="${selected === option}">${option}</option>
`;

/** Restaurant image URL. */
// imageUrlForRestaurant :: str -> str
export const imageUrlForRestaurant = ({photograph}) =>
  photograph ? `/img/${photograph}.jpg` : '';

/**
 * NOTE: For the alt tag, different reviewers have expressed different
 *       preferences with regards to the proper text. In an effort to please
 *       everyone, we opt for the cumbersome but accurate "interior or exterior"
 * NOTE: We opt to use h1 in restaurant and review listings, since h1 is
 *       allowed and prefered by the outline algorithm. However, since
 *       UAs don't implement outline, we assist users by using the
 *       aria-labelledby attribute to explicitly link h1s to their sections.
 *       see https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Using_HTML_sections_and_outlines
 * NOTE: we opt not to tab-index restaurant header, since the interactive
 *       control 'view details' will receive focus.
 *       name.tabIndex = 0;
 * NOTE: It might be a little unorthodox to use both aria-label and the label element,
 *       but in this case it give us emoji so I'm down.
 */
const restaurantCardTemplate = restaurant => html`
  <li id="${restaurant.name}" aria-labelledby="${restaurant.name}">
    <lazy-image class="restaurant-image" fade
        rootMargin="80px"
        placeholder="${placeholderImage}"
        src="${imageUrlForRestaurant(restaurant)}"
        alt="Interior or exterior of ${restaurant.name}"></lazy-image>
    <h1 id="${restaurant.name}">${restaurant.name}</h1>
    <div class="checkbox">
      <input id="${nameToId(restaurant.name)}-checkbox"
          type="checkbox"
          aria-label="${restaurant.is_favorite ? 'favourite' : 'not favourite'}"
          value="favourite"
          checked?="${restaurant.is_favorite}"/>
      <label for="${nameToId(restaurant.name)}-checkbox"></label>
    </div>
    <p>${restaurant.neighbourhood}</p>
    <address>${restaurant.address}</address>
    <a href="${urlForRestaurant(restaurant)}">More Details</a>
  </li>
`;

const restaurantCardsTemplate = restaurants =>
    // case: bad input: display an error
    !Array.isArray(restaurants) ? html`There was a problem showing the restaurants. Please try again.`
    // case: no restaurants: tell the use that the filters exclude all options
  : !restaurants.length ? html`<li class="no-restaurants">No restaurants matching those filters</li>`
    // case: restaurants: return a list of restaurantCardTemplate
  : restaurants.map(restaurantCardTemplate);

const restaurantsTemplate = (component, restaurants, cuisine, neighbourhood) => {
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
            on-google-map-ready="${event => restaurants
              .then(filter(byCuisineAndNeighbourhood(cuisine, neighbourhood)))
              .then(map(mapMarker(event.detail)))}">
        </good-map>
      </div>
      <section>
        <div class="filter-options">
          <h2>Filter Results</h2>

          <select id="neighbourhoods-select"
              name="neighbourhoods"
              aria-label="Neighbourhoods"
              on-change="${event => component.neighbourhood = event.target.value}">
            <option value="all">All Neighbourhoods</option>
            ${restaurants.then(compose(map(optionTemplate(neighbourhood)), uniqueNeighbourhoods))}
          </select>

          <select id="cuisines-select"
              name="cuisines"
              aria-label="Cuisines"
              on-change="${event => component.cuisine = event.target.value}">
            <option value="all">All Cuisines</option>
            ${restaurants.then(compose(map(optionTemplate(cuisine)), uniqueCuisines))}
          </select>

        </div>

        <ul id="restaurants-list">${
          restaurants
            .then(filter(byCuisineAndNeighbourhood(cuisine, neighbourhood)))
            .then(restaurantCardsTemplate)
          }</ul>

      </section>
    </section>
  </main>`;
};

const hoursRowTemplate = ([dayString, hoursString]) => html`
  <tr>
    <td><time>${dayString}</time></td>
    <td>${hoursString.split(', ').map(formatOpeningToClosing).join(', ')}</td>
  </tr>
`;

const hoursTemplate = hours => Object.entries(hours).map(hoursRowTemplate);

// NOTE: We opt to use h1 in restaurant and review listings, since h1 is
//       allowed and prefered by the outline algorithm. However, since
//       UAs don't implement outline, we assist users by using the
//       aria-labelledby attribute to explicitly link h1s to their sections.
export const reviewTemplate = ({comments, createdAt, updatedAt, name, rating}) => {
  const id = nameToId(name);
  const reviewTimeHuman = formatDistance(updatedAt || createdAt, Date.now(), {addSuffix: true});
  return html`
  <article aria-labelledBy="${id}">
    <header>
      <h1 id="${id}" tab-index="0">${name}</h1>
      <time>${reviewTimeHuman}</time>
    </header>
    <span>Rating: <emoji-rating
        min="0" max="5"
        low="2" high="4"
        optimum="5" value="${rating}"></emoji-rating></span>
    <p>${comments}</p>
  </article>
  `;
};

const reviewsTemplate = reviews =>
    !Array.isArray(reviews) ? html`There was a problem showing the reviews. Please try again.`
  : !reviews.length ? html`<p>No Reviews Yet!</p>`
  : reviews.map(reviewTemplate);

const restaurantTemplate = (component, restaurant) => {
  return html`
  ${styles}
  ${restaurantStyles}
  <main id="maincontent">
    <section id="map-container">
      ${html`${until(restaurant.then(
        restaurant => html`
        <good-map id="map"
            latitude="${restaurant.latlng.lat}"
            longitude="${restaurant.latlng.lng}"
            api-key="AIzaSyD3E1D9b-Z7ekrT3tbhl_dy8DCXuIuDDRc"
            zoom="12"
            map-options='{"scrollwheel": false}'
            on-google-map-ready="${event => mapMarker(event.detail)(restaurant)}">
        </good-map>`
      ), '')}`}
    </section>
    <section id="restaurant-container">
      <h1 id="restaurant-name" tabindex="0">${restaurant.then(prop('name'))}</h1>
      <figure id="restaurant-image-container">
      ${until(restaurant.then(
        restaurant => html`
        <lazy-image id="restaurant-image" fade
            rootMargin="40px"
            placeholder="${placeholderImage}"
            src="${imageUrlForRestaurant(restaurant)}"
            alt="Interior or exterior of ${[restaurant].map(prop('name'))}"></lazy-image>`
          ), '')}
        <figcaption id="restaurant-cuisine">${restaurant.then(prop('cuisine_type'))}</figcaption>
      </figure>
      <div id="restaurant-details-container">
        <address id="restaurant-address"
            tabindex="0"
            aria-label="Address">${restaurant.then(prop('address'))}</address>
        <table id="restaurant-hours"
            tabindex="0"
            aria-label="Hours">${restaurant.then(compose(hoursTemplate, prop('operating_hours')))}</table>
      </div>
    </section>

    <section id="reviews-container" tabindex="0" aria-label="Reviews">
      <h2>Reviews</h2>
      <div id="reviews-list">
        ${restaurant.then(prop('id')).then(fetchReviews).then(reviewsTemplate)}
      </div>
    </section>
    <submit-review id="review-fab" restaurantId="${restaurant.then(prop('id'))}" on-review-submitted="${() => component.reviews = restaurant.then(prop('id')).then(fetchReviews)}"></submit-review>
  </main>`;
};

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

export default class RestaurantReviews extends LitElement {

  static get properties() {
    return {
      restaurantId: String,
      restaurant: Object,
      reviews: Array,
      neighbourhood: String,
      cuisine: String,
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

  render({cuisine, neighbourhood, restaurantId}) {
    return restaurantId ? restaurantTemplate(this, fetchRestaurantById(restaurantId))
      : restaurantsTemplate(this, fetchRestaurants(), cuisine, neighbourhood);
  }
}

customElements.define('restaurant-reviews', RestaurantReviews);
