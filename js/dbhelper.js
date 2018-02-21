import { handleAsJson, rejectNon200, returnOrThrow } from './promise.js';
import { filter, find, map, uniq } from './array.js';
import { trace } from './log.js';
import compose from './compose.js';

const prop = name => o => o[name];

const uniqueNeighborhoods = compose(uniq, map(prop('neighborhood')));

const uniqueCuisines = compose(uniq, map(prop('cuisine_type')));

/**
 * Common database helper functions.
 */
export default class DBHelper {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 8001; // Change this to your server port
    return `http://localhost:${port}/data/restaurants.json`;
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants() {
    return fetch(DBHelper.DATABASE_URL)
      .then(rejectNon200)
      .then(handleAsJson)
      // .then(trace('fetchRestaurants JSON'))
      .then(prop('restaurants'));
      // .then(trace('fetchRestaurants Array'));
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id) {
    // fetch all restaurants with proper error handling.
    return DBHelper.fetchRestaurants()
      // .then(trace('fetchRestaurants'))
      // Loose equivalency in this predicate, as `id` may be passed as a string.
      .then(find(r => r.id == id))
      // .then(trace('find'))
      .then(returnOrThrow(`Restaurant id ${id} does not exist`));
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine) {
    // Fetch all restaurants. Empty results are treated as an error.
    return DBHelper.fetchRestaurants()
      // Filter restaurants to have only given cuisine type
      .then(filter(r => r.cuisine_type === cuisine))
      .then(returnOrThrow(`No restaurants found for cuisine ${cuisine}`));
  }

  /**
   * Fetch restaurants by a neighborhood
   */
  static fetchRestaurantByNeighborhood(neighborhood) {
    // Fetch all restaurants
    return DBHelper.fetchRestaurants()
      // Filter restaurants to have only given neighborhood
      .then(filter(r => r.neighborhood === neighborhood))
      .then(returnOrThrow(`No restaurants found for neighborhood ${neighborhood}`));
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood) {
    const filterCuisine = r => r.cuisine_type == cuisine;
    const filterNeighborhood = r => r.neighborhood == neighborhood;
    const byCuisineAndNeighborhood =
        cuisine != 'all' ? filterCuisine
      : neighborhood != 'all' ? filterNeighborhood
      : x => x;

    // Fetch all restaurants
    return DBHelper.fetchRestaurants()
      .then(filter(byCuisineAndNeighborhood))
      .then(returnOrThrow(`No restaurants found for cuisine ${cuisine} or neighborhood ${neighborhood}`));
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods() {
    // Fetch all restaurants
    return DBHelper.fetchRestaurants()
      .then(uniqueNeighborhoods)
      .then(returnOrThrow('Could not find neighborhoods'));
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines() {
    // Fetch all restaurants
    return DBHelper.fetchRestaurants()
      .then(uniqueCuisines)
      .then(returnOrThrow('Could not find cuisines'));

  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return (`/img/${restaurant.photograph}`);
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const position = restaurant.latlng;
    const title = restaurant.name;
    const url = DBHelper.urlForRestaurant(restaurant);
    const animation = google.maps.Animation.DROP;
    return new google.maps.Marker({ animation, map, position, title, url });
  }

}
