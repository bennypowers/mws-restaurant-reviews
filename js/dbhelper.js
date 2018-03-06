import idbKeyval from './idb-keyval.js';
import { handleAsJson, handleAsText, rejectNon200, returnOrThrow, trace } from './lib.js';

// Database URL
const DATABASE_URL = `/api/restaurants/`;

/** Perform the network request to get the restaurants. */
// fetchFromNetwork :: () -> Promise rs
const fetchFromNetwork = () => fetch(DATABASE_URL)
  .then(rejectNon200)
  .then(handleAsJson)

// cacheInIdb :: String -> d -> Promise undefined
const cacheInIdb = key => value =>
  idbKeyval.set(DATABASE_URL, value);

// cacheRestaurants :: restaurants -> Promise undefined
const cacheRestaurants = cacheInIdb(DATABASE_URL);

// cacheAndReturnRestaurants :: restaurants -> Promise restaurants
const cacheAndReturnRestaurants = restaurants =>
  cacheRestaurants(restaurants)
    .then(() => restaurants);

// updateCacheFromNetwork :: () -> Promise restaurants
const updateCacheFromNetwork = () =>
    fetchFromNetwork()
      .then(cacheAndReturnRestaurants)
      .then(returnOrThrow('Could not fetch restaurants'))

/** Returns cached restaurants */
// fetchIfNotCached :: restaurants -> Promise restaurants
const fetchIfNotCached = restaurants =>
    restaurants ? Promise.resolve(restaurants) : updateCacheFromNetwork();

/** First checks the cache, then updates from the network if cached results were found. */
// fetchRestaurants :: () -> Promise rs
export const fetchRestaurants = () =>
  idbKeyval.get(DATABASE_URL)
    .then(fetchIfNotCached)
    .then(updateCacheFromNetwork)

// Fetch a restaurant by its ID.
// fetchRestaurantById :: str -> Promise r
export const fetchRestaurantById = (id) =>
  fetch(DATABASE_URL + id)
    .then(rejectNon200)
    .then(handleAsJson)
    .then(returnOrThrow(`Restaurant id ${id} does not exist`));

export const putFavorite = ({ restaurant_id, is_favorite }) =>
  fetch(`/api/restaurant/${restaurant_id}?is_favorite=${!!is_favorite}`, {
    method: 'PUT',
  })
  .then(rejectNon200)
  .then(handleAsJson)
  .then(returnOrThrow(`Couldn't update favorite status for restaurant ${restaurant_id}:`));

export const postReview = ({ comments, name, rating, restaurant_id }) =>
  fetch('/api/reviews', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ comments, name, rating, restaurant_id }),
  })
  .then(rejectNon200)
  .then(handleAsJson)
  .then(returnOrThrow(`Couldn't post review for restaurant ${restaurant_id}:`));

export const putReview = ({ comments, name, rating, review_id }) =>
  fetch(`/api/reviews/${review_id}`, {
    method: 'PUT',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ comments, name, rating }),
  })
  .then(rejectNon200)
  .then(handleAsJson)
  .then(returnOrThrow(`Couldn't update review ${review_id}:`));

export const deleteReview = ({ comments, name, rating, review_id }) =>
  fetch(`/api/reviews/${review_id}`, {
    method: 'DELETE',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ comments, name, rating, review_id }),
  })
  .then(rejectNon200)
  .then(handleAsText)
  .then(returnOrThrow(`Couldn't delete review ${review_id}:`));
