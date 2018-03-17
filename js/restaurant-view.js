import { LitElement, html } from '/node_modules/@polymer/lit-element/lit-element.js';

import { compose, prop, placeholderImage, trim } from './lib.js';

import { mapMarker, imageUrlForRestaurant } from './map-marker.js';

import { putFavorite } from './dbhelper.js';

import '/node_modules/@power-elements/emoji-checkbox/emoji-checkbox.js';

import './review-card.js';

import styles from './styles.js';

import restaurantStyles from './restaurant-styles.js';

// takes a string like "11:00 am - 5:00 pm" and returns semantic html
// str -> str
const formatOpeningToClosing = string =>
  string.split(' - ')
    .map(trim)
    .join(' - ');

const hoursTemplate = hours =>
  Object.entries(hours || {})
    .map(hoursRowTemplate);

const hoursRowTemplate = ([dayString, hoursString]) => html`
  <tr>
    <td><time>${dayString}</time></td>
    <td>${hoursString.split(', ').map(formatOpeningToClosing).join(', ')}</td>
  </tr>
`;

const hours = compose(hoursTemplate, prop('operating_hours'));

class RestaurantView extends LitElement {

  static get properties() {
    return {
      restaurant: Object,
    };
  }

  onCheckedChanged(event) {
    event.detail.value !== this.favourite &&
    putFavorite({restaurant_id: this.restaurant.id, is_favorite: event.detail.value});
  }

  render({restaurant}) {
    const { address, cuisine_type, id, latlng, name } = restaurant || {};
    const { lat, lng } = latlng || {};

    return html`
    ${styles}
    ${restaurantStyles}
    <style>
    h1 {
      max-width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    </style>
    <main id="maincontent">
      <section id="map-container">
        <good-map id="map"
            latitude="${lat}"
            longitude="${lng}"
            api-key="AIzaSyD3E1D9b-Z7ekrT3tbhl_dy8DCXuIuDDRc"
            zoom="12"
            map-options='{"scrollwheel": false}'
            on-google-map-ready="${event => mapMarker(event.detail)(restaurant)}">
        </good-map>
      </section>

      <section id="restaurant-container">
        <h1 id="restaurant-name" tabindex="0">
          ${name}
          <emoji-checkbox
              full="😎"
              empty="💩"
              on-checked-changed="${event => this.onCheckedChanged(event)}"
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
          <figcaption id="restaurant-cuisine">${cuisine_type}</figcaption>
        </figure>

        <div id="restaurant-details-container">
          <address id="restaurant-address"
              tabindex="0"
              aria-label="Address">${address}</address>
          <table id="restaurant-hours"
              tabindex="0"
              aria-label="Hours">${hours(restaurant)}</table>
        </div>

      </section>

      <section id="reviews-container" tabindex="0" aria-label="Reviews">
        <h2>Reviews</h2>
        <slot></slot>
        <div id="reviews-list"><slot></slot></div>
      </section>

      <submit-review id="review-fab"
          restaurantId="${id}"
          on-review-submitted="${this.onReviewSubmitted}"></submit-review>

    </main>`;
  }
}

customElements.define('restaurant-view', RestaurantView);
