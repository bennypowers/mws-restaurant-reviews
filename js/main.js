import { fetchRestaurants } from './dbhelper.js';

import {
  and,
  append,
  compose,
  customEvent,
  eq,
  filter,
  nameToId,
  prop,
  traceError,
  uniqueByKey,
} from './lib.js';

import {
  imageUrlForRestaurant,
  mapMarkerForRestaurant,
  titleMap,
  urlForRestaurant,
} from './maphelper.js';

window.restaurants = window.restaurants || undefined;
window.neighborhoods = window.neighborhoods || undefined;
window.cuisines = window.cuisines || undefined;
window.map = window.map || undefined;
window.markers = window.markers || [];

// uniqueNeighborhoods :: o -> ks
const uniqueNeighborhoods = uniqueByKey('neighborhood');

// uniqueCuisines :: o -> ks
const uniqueCuisines = uniqueByKey('cuisine_type');

/** Predicate the filters by cuisine, neighborhood, or both. */
// byCuisineAndNeighborhood :: (s, s) -> f
const byCuisineAndNeighborhood = (cuisine='all', neighborhood='all') => {
  const filterCuisine = compose(eq(cuisine), prop('cuisine_type'));
  const filterNeighborhood = compose(eq(neighborhood), prop('neighborhood'));
  return (
      cuisine != 'all' && neighborhood != 'all' ? and(filterCuisine, filterNeighborhood)
    : cuisine != 'all' ? filterCuisine
    : neighborhood != 'all' ? filterNeighborhood
    : x => x
  );
};

/** Creates an <option> element. */
// createOption :: str -> DOM
const createOption = name => {
  const option = document.createElement('option');
        option.innerHTML = name;
        option.value = name;
  return option;
};

// setRestaurantsReference :: a -> a
const setRestaurantsReference = restaurants =>
  (self.restaurants = restaurants, restaurants);

/** Adds markers for current restaurants to the map. */
// addMarkersToMap :: a -> a
const addMarkersToMap = restaurants =>
  (restaurants.forEach(addMarkerToMap), restaurants);

/** Fires a 'restaurant-fetched' event on the document. */
const dispatchRestaurants = restaurants => (
  document.dispatchEvent(customEvent('restaurants-fetched', {restaurants})),
  restaurants
);

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 * Update restaurants when user makes a selection.
 */
document.addEventListener('restaurants-fetched', event => {
  const {restaurants} = event.detail;

  const neighborhoodsSelect = document.getElementById('neighborhoods-select');
  const cuisinesSelect = document.getElementById('cuisines-select');

  // Update the restaurant list when user selects a filter
  neighborhoodsSelect.addEventListener('change', () => updateRestaurants(self.restaurants));
  cuisinesSelect.addEventListener('change', () => updateRestaurants(self.restaurants));

  uniqueNeighborhoods(restaurants)
    .map(createOption)                  // [options]
    .map(append(neighborhoodsSelect));  // side effect

  uniqueCuisines(restaurants)
    .map(createOption)              // [options]
    .map(append(cuisinesSelect)); // side effect
});

// Initialize Google map, called from HTML.
window.initMap = () => {
  const el = document.getElementById('map');
  // initialize google maps
  const zoom = 12;
  const scrollwheel = false;
  const center = new google.maps.LatLng(40.722216, -73.987501);
  const map = new google.maps.Map(el, {zoom, center, scrollwheel});

  titleMap(map, 'Restaurant Map');

  self.map = map;

  return fetchRestaurants(self.restaurants)
    .then(dispatchRestaurants)
    .then(setRestaurantsReference)
    .then(updateRestaurants)
    .catch(traceError('Problem fetching restaurants:'));
};

/** Update page and map for current restaurants. */
// updateRestaurants :: rs -> Promise rs
const updateRestaurants = restaurants => {
  if (!restaurants) return;

  const cuisine = document.getElementById('cuisines-select').value;
  const neighborhood = document.getElementById('neighborhoods-select').value;

  return Promise.resolve(restaurants)
    .then(filter(byCuisineAndNeighborhood(cuisine, neighborhood)))
    .then(resetRestaurants)
    .then(removeAllMapMarkers)
    .then(fillRestaurantsHTML)
    .then(addMarkersToMap)
    .catch(traceError('updateRestaurants'));
};

/** Clear current restaurants, their HTML and remove their map markers. */
// resetRestaurants :: rs -> rs
const resetRestaurants = restaurants => {
  const ul = document.getElementById('restaurants-list');
        ul.innerHTML = '';
  return restaurants;
};

/** Remove all map markers. */
// removeAllMapMarkers :: rs -> rs
const removeAllMapMarkers = restaurants => {
  self.markers.forEach(m => m.setMap(null));
  self.markers = [];
  return restaurants;
};

/** Create all restaurants HTML and add them to the webpage. */
// fillRestaurantsHTML :: rs -> rs
const fillRestaurantsHTML = restaurants => {
  if (!Array.isArray(restaurants)) throw new Error('Could not generate restauratn DOM');
  const ul = document.getElementById('restaurants-list');
  const nodes = restaurants.map(createRestaurantHTML);
        nodes.forEach(append(ul));

  if (!nodes.length) {
    const li = document.createElement('li');
          li.className = 'no-restaurants';
          li.innerHTML = 'No Restaurants Matching Those Filters';
    ul.append(li);
  }

  return restaurants;
};

/** Create restaurant HTML. */
// createRestaurantHTML :: r -> DOM
const createRestaurantHTML = restaurant => {
  const id = nameToId(restaurant.name);
  const li = document.createElement('li');
        li.setAttribute('aria-labelledby', id);

  const image = document.createElement('img');
        image.className = 'restaurant-img';
        image.alt = `Restaurant photograph of ${restaurant.name}`;
        image.src = imageUrlForRestaurant(restaurant);
  li.append(image);

  const name = document.createElement('h1');
        name.innerHTML = restaurant.name;
        // NOTE: We opt to use h1 in restaurant and review listings, since h1 is
        //       allowed and prefered by the outline algorithm. However, since
        //       UAs don't implement outline, we assist users by using the
        //       aria-labelledby attribute to explicitly link h1s to their sections.
        // see https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Using_HTML_sections_and_outlines
        name.id = id;
        // NOTE: we opt not to tab-index restaurant header, since the interactive
        // control 'view details' will receive focus.
        // name.tabIndex = 0;
  li.append(name);

  const neighborhood = document.createElement('p');
        neighborhood.innerHTML = restaurant.neighborhood;
  li.append(neighborhood);

  const address = document.createElement('p');
        address.innerHTML = restaurant.address;
  li.append(address);

  const more = document.createElement('a');
        more.innerHTML = 'View Details';
        more.href = urlForRestaurant(restaurant);
  li.append(more);

  return li;
};

/** Add marker to the map */
// addMarkerToMap :: r -> r
const addMarkerToMap = restaurant => {
  const marker = mapMarkerForRestaurant(restaurant, self.map);
  google.maps.event.addListener(marker, 'click', () => {
    window.location.href = marker.url;
  });
  self.markers = [...(self.markers || []), marker];
  return restaurant;
};
