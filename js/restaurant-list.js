import './restaurant-card.js';

import { LitElement, html } from '../node_modules/@polymer/lit-element/lit-element.js';

import { mapMarker } from './map-marker.js';

import styles from './styles.js';

class RestaurantList extends LitElement {

  static get properties() {
    return {
      restaurants: Array,
      neighbourhood: String,
    };
  }

  addMarkers({map, restaurants = [], markers = []}) {
    if (!window.google) return;
    markers.forEach(m => m.setMap(null));
    this.markers = restaurants.map(mapMarker(map));
  }

  render({ restaurants = [] }) {

    const { map } = this.shadowRoot.querySelector('good-map') || {};
    const { markers } = this;
    this.addMarkers({map, restaurants, markers});

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
                on-google-map-ready="${
                  event =>
                    this.addMarkers({
                      map: event.detail,
                      restaurants,
                      markers,
                }) }">
            </good-map>
          </div>
          <section>
            <div class="filter-options">
              <h2>Filter Results</h2>

              <slot name="filters">
                <select aria-label="Neighbourhoods">
                  <option value="all">All Neighbourhoods</option>
                </select>

                <select aria-label="Cuisines">
                  <option value="all">All Cuisines</option>
                </select>
              </slot>

            </div>

            <ul id="restaurants-list">
              <slot></slot>
            </ul>

          </section>
        </section>
      </main>`;
    }
  }

customElements.define('restaurant-list', RestaurantList);
