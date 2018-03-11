import { installRouter } from './router.js';

import { fetchRestaurants, fetchRestaurantById, fetchReviews } from './dbhelper.js';

import { LitElement, html } from '/node_modules/@polymer/lit-element/lit-element.js';

import { render } from '/node_modules/lit-html/lit-html.js';

import { until } from '/node_modules/lit-html/lib/until.js';

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
  `./restaurant?id=${id}`;

// takes a string like "11:00 am - 5:00 pm" and returns semantic html
// str -> str
const formatOpeningToClosing = string =>
  string.split(' - ')
    .map(trim)
    .join(' - ');

const loadingTemplate = html`
${styles}
<main id="maincontent">
  <section name="restaurants">
    <section id="map-container" role="application">
      <div id="map"></div>
    </section>
  </section>
</main>
`;

const mapMarker = restaurant =>  html`
  <google-map-marker
      animation="DROP"
      latitude="${restaurant.latlng.lat}"
      longitude="${restaurant.latlng.lng}"
      label="${restaurant.name}"
      url="${urlForRestaurant(restaurant)}"></google-map-marker>
`;

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
 */
const restaurantCardTemplate = restaurant => html`
  <li id="${restaurant.name}" aria-labelledby="${restaurant.name}">
    <img src="${imageUrlForRestaurant(restaurant)}" alt="Interior or exterior of ${restaurant.name}" class="restaurant-image"/>
    <h1 id="${restaurant.name}">${restaurant.name}</h1>
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
  const filteredRestaurants = restaurants
    .filter(byCuisineAndNeighbourhood(cuisine, neighbourhood));

  return html`
  ${styles}
  <main id="maincontent">
    <section name="restaurants">
      <div id="map-container">
        <google-map id="map"
            fit-to-markers
            api-key="AIzaSyD3E1D9b-Z7ekrT3tbhl_dy8DCXuIuDDRc"
            latitude="40.722216"
            longitude="-73.987501"
            zoom="12"
            additionalMapOptions='{"scrollwheel": false}'>
          ${filteredRestaurants.map(mapMarker)}
        </google-map>
      </div>
      <section>
        <div class="filter-options">
          <h2>Filter Results</h2>

          <select id="neighbourhoods-select"
              name="neighbourhoods"
              aria-label="Neighbourhoods"
              on-change="${event => component.neighbourhood = event.target.value}">
            <option value="all">All Neighbourhoods</option>
            ${uniqueNeighbourhoods(restaurants).map(optionTemplate(neighbourhood))}
          </select>

          <select id="cuisines-select"
              name="cuisines"
              aria-label="Cuisines"
              on-change="${event => component.cuisine = event.target.value}">
            <option value="all">All Cuisines</option>
            ${uniqueCuisines(restaurants).map(optionTemplate(cuisine))}
          </select>

        </div>

        <ul id="restaurants-list">${restaurantCardsTemplate(filteredRestaurants)}</ul>

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
    <span>Rating: <meter min="0" max="5" low="2" high="4" optimum="5" value="${rating}"></meter></span>
    <p>${comments}</p>
  </article>
  `;
};

const reviewsTemplate = reviews =>
    !Array.isArray(reviews) ? html`There was a problem showing the reviews. Please try again.`
  : !reviews.length ? html`<p>No Reviews Yet!</p>`
  : reviews.map(reviewTemplate);

const restaurantTemplate = (component, restaurant, reviews) => {
  import('/js/submitReview.js');
  return html`
  ${styles}
  ${restaurantStyles}
  <main id="maincontent">
    <section id="map-container">
      <google-map id="map"
          fit-to-markers
          api-key="AIzaSyD3E1D9b-Z7ekrT3tbhl_dy8DCXuIuDDRc"
          latitude="40.722216"
          longitude="-73.987501"
          zoom="12"
          additional-map-options='{"scrollwheel": false}'>
        ${mapMarker(restaurant)}
      </google-map>
    </section>
    <section id="restaurant-container">
      <h1 id="restaurant-name" tabindex="0">${restaurant.name}</h1>
      <figure id="restaurant-image-container">
        <img id="restaurant-image" src="${imageUrlForRestaurant(restaurant)}" alt="Iterior or Exterior of ${restaurant.name}">
        <figcaption id="restaurant-cuisine">${restaurant.cuisine_type}</figcaption>
      </figure>
      <div id="restaurant-details-container">
        <address id="restaurant-address" tabindex="0" aria-label="Address">${restaurant.address}</address>
        <table id="restaurant-hours" tabindex="0" aria-label="Hours">${hoursTemplate(restaurant.operating_hours)}</table>
      </div>
    </section>

    <section id="reviews-container" tabindex="0" aria-label="Reviews">
      <h2>Reviews</h2>
      <div id="reviews-list">
        ${fetchReviews(restaurant.id).then(reviewsTemplate)}
      </div>
    </section>
    <submit-review id="review-fab" restaurantId="${restaurant.id}" on-review-submitted="${event => reviews = fetchReviews(restaurant.id)}"></submit-review>
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
    return html`${until(
        restaurantId ? fetchRestaurantById(restaurantId)
          .then(restaurant => restaurantTemplate(this, restaurant))
      : fetchRestaurants().then(restaurants => restaurantsTemplate(this, restaurants, cuisine, neighbourhood)),
      loadingTemplate
    )}`;
  }
}

customElements.define('restaurant-reviews', RestaurantReviews);
