import { traceError } from './log.js';
import DBHelper from './dbhelper.js';

window.restaurants = window.restaurants || undefined;
window.neighborhoods = window.neighborhoods || undefined;
window.cuisines = window.cuisines || undefined;
window.map = window.map || undefined;
window.markers = window.markers || [];

// comma operator returns param after setting ref, parens emphasize cohesion

const setNeighborhoodsReference = neighborhoods =>
  (self.neighborhoods = neighborhoods, neighborhoods);

const setCuisinesReference = cuisines =>
  (self.cuisines = cuisines, cuisines);

const createOption = name => {
  const option = document.createElement('option');
        option.innerHTML = name;
        option.value = name;
  return option;
};

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 * Update restaurants when user makes a selection.
 */
document.addEventListener('DOMContentLoaded', event => {
  fetchNeighborhoods(event);
  fetchCuisines(event);
  // Update the restaurant list when user selects a filter
  const neighborhoods = document.getElementById('neighborhoods-select');
        neighborhoods.addEventListener('change', updateRestaurants);
  const cuisines = document.getElementById('cuisines-select');
        cuisines.addEventListener('change', updateRestaurants);
});

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  const el = document.getElementById('map');
  // initialize google maps
  const zoom = 12;
  const scrollwheel = false;
  const center = new google.maps.LatLng(40.722216, -73.987501);
  self.map = new google.maps.Map(el, {zoom, center, scrollwheel});
  updateRestaurants();
};

/**
 * Fetch all neighborhoods and set their HTML.
 */
export const fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods()
    .then(setNeighborhoodsReference)
    .then(fillNeighborhoodsHTML)
    .catch(traceError('fetchNeighborhoods'));
};

/**
 * Fetch all cuisines and set their HTML.
 */
export const fetchCuisines = () => {
  DBHelper.fetchCuisines()
    .then(setCuisinesReference)
    .then(fillCuisinesHTML)
    .catch(traceError('Could not fetch cuisines'));
};

/**
 * Set neighborhoods HTML.
 */
export const fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods
    .map(createOption)
    .forEach(option => select.append(option));
  return neighborhoods;
};

/**
 * Set cuisines HTML.
 */
export const fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');
  cuisines
    .map(createOption)
    .forEach(option => select.append(option));
  return cuisines;
};

/**
 * Update page and map for current restaurants.
 */
export const updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood)
    .then(resetRestaurants)
    .then(fillRestaurantsHTML)
    .catch(traceError('fetchRestaurantByCuisineAndNeighborhood'));
};

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
export const resetRestaurants = (restaurants) => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  self.markers.forEach(m => m.setMap(null));
  self.markers = [];
  self.restaurants = restaurants;
  return restaurants;
};

/**
 * Create all restaurants HTML and add them to the webpage.
 */
export const fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list');
  restaurants.forEach(restaurant => ul.append(createRestaurantHTML(restaurant)));
  addMarkersToMap();
  return restaurants;
};

/**
 * Create restaurant HTML.
 */
export const createRestaurantHTML = (restaurant) => {
  const li = document.createElement('li');

  const image = document.createElement('img');
  image.className = 'restaurant-img';
  image.alt = `Photograph of ${restaurant.name}`;
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  li.append(image);

  const name = document.createElement('h1');
  name.innerHTML = restaurant.name;
  li.append(name);

  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  li.append(neighborhood);

  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  li.append(address);

  const more = document.createElement('a');
  more.innerHTML = 'View Details';
  more.href = DBHelper.urlForRestaurant(restaurant);
  li.append(more);

  return li;
};

/**
 * Add markers for current restaurants to the map.
 */
export const addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url;
    });
    self.markers.push(marker);
  });
  return restaurants;
};
