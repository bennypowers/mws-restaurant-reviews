import { LitElement, html } from '../node_modules/@polymer/lit-element/lit-element.js';

import { compose, prop, placeholderImage, trim } from './lib.js';

import { mapMarker, imageUrlForRestaurant } from './map-marker.js';

import { putFavorite } from './dbhelper.js';

import '../node_modules/@power-elements/emoji-checkbox/emoji-checkbox.js';
import '../node_modules/@power-elements/power-fab/power-fab.js';

import './review-card.js';

import styles from './styles.js';

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

  render({ restaurant }) {
    const { address, cuisine_type, id, is_favorite, latlng, name } = restaurant || {};
    const { lat, lng } = latlng || {};

    return html`
    ${styles}
    <style>
    h1 {
      max-width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    /* ====================== Restaurant Details ====================== */

    header {
      position: relative;
      top: 0;
      width: 100%;
      z-index: 1000;
    }

    #map-container {
      position: relative;
      max-height: 50vh;
      /* height: 87%; */
      /* position: fixed; */
      /* right: 0; */
      /* top: 80px; */
      /* width: 50%; */
    }

    #footer {
      bottom: 0;
      position: absolute;
      width: calc(100% - 50px);
      /* large screens */
      /* width: 50%; */
    }

    #form-fab {
      background-color: crimson;
      position: fixed;
      bottom: 1em;
      right: 1em;
      z-index: 2000;
    }

    #restaurant-container {
      display: grid;
      max-width: 100%;
      overflow: hidden;
    }

    #restaurant-container,
    #reviews-container {
      border-bottom: 1px solid #d9d9d9;
      border-top: 1px solid #fff;
    }

    #restaurant-container {
      padding: 30px 0;
    }

    #reviews-container {
      padding: 30px 40px;
    }

    #restaurant-container h1 {
      padding: 0 40px;
      flex: 1 0 auto;
    }

    #restaurant-details-container,
    #restaurant-image-container {
      padding: 0 40px;
      margin: 0;
    }

    @media screen and (min-width: 500px) {
      #maincontent {
        display: flex;
        flex-wrap: wrap;
      }

      #restaurant-container,
      #reviews-container,
      #map-container {
        flex: 1 1 auto;
        max-width: 50%;
        height: auto !important;
      }

      #restaurant-container {
        order: 0;
      }

      #map-container {
        order: 1;
      }

      #reviews-container {
        order: 2;
        max-width: 100%;
      }
    }

    @media (min-width: 630px) {
      #restaurant-container h1 {
        grid-column-end: span 2;
      }

      #restaurant-container {
        display: flex;
        flex-flow: row wrap;
      }
    }

    @media (min-width: 960px) {
      #restaurant-container {
        display: grid;
        grid-column-gap: 2%;
        grid-template-columns: repeat(2, 1fr);
      }

      #restaurant-details-container,
      #restaurant-image-container {
        padding: 0;
      }

      #restaurant-details-container {
        padding-right: 40px;
      }

      #restaurant-image-container {
        padding-left: 40px;
      }

      #reviews-list {
        grid-template-columns: 33% 33% 33%;
        grid-column-gap: 0.5%;
      }
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
            on-google-map-ready="${
              event =>
                mapMarker(event.detail)(restaurant)
            }">
        </good-map>
      </section>

      <section id="restaurant-container">
        <h1 id="restaurant-name" tabindex="0">
          ${name}
          <emoji-checkbox
              full="😎"
              empty="💩"
              on-checked-changed="${
                event =>
                  restaurant &&
                  restaurant.favourite != null &&
                  event.detail.value !== restaurant.favourite &&
                  putFavorite({
                    restaurant_id: id,
                    is_favorite: event.detail.value
                  })
                }"
              title="${is_favorite ? 'Favourite!' : 'Not Favourite'}"
              checked?="${is_favorite}"
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
        <div id="reviews-list"><slot></slot></div>
      </section>

      <power-fab id="form-fab"
          label="+"
          title="Add Review"
          on-active-changed="${ event => this.shadowRoot.querySelector('submit-review').toggleOpened(event) }"></power-fab>

      <submit-review id="review-fab"
          restaurantId="${id}"
          on-review-submitted="${this.onReviewSubmitted}"></submit-review>

    </main>`;
  }
}

customElements.define('restaurant-view', RestaurantView);
