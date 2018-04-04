import idbKeyval from './idb-keyval.js';
import { asArray, constant, handleAsJson, handleAsText, rejectNon200, returnOrThrow } from './lib.js';

// TODO: All these functions should cache in idb. in case of PUT/POST/DELETE,
//       they should cache on a unique string (keyed to time?) as pending requests,
//       then when the request succeeds, remove themselves from the cache. In this way,
//       we'll implement background sync.


// setKv :: key -> value -> Promise undefined
const setKv = key => value =>
  idbKeyval.set( value.id ? `${key}/${value.id}` : `${key}`, value );

// cacheInIdb :: String -> d -> Promise value
const cacheInIdb = key => value =>
  Promise.all( asArray(value).map( setKv(key) ) )
    .then( constant(value) );

/** Fetch all restaurants */
// fetchRestaurants :: () -> Promise rs
export const fetchRestaurants = () =>
  fetch('/api/restaurants')
    .then(rejectNon200)
    .then(handleAsJson)
    .then(cacheInIdb('restaurants'));

/** Fetch reviews by restaurant id. */
// fetchReviews :: () -> Promise rs
export const fetchReviews = id => !id ? Promise.resolve(null) :
  fetch(`/api/reviews/${id ? `?restaurant_id=${id}` : ''}`)
    .then(rejectNon200)
    .then(handleAsJson)
    .then(cacheInIdb('reviews'));

/** Fetch a restaurant by its ID. */
// fetchRestaurantById :: str -> Promise r
export const fetchRestaurantById = (id) => !id ? Promise.resolve(null) :
  fetch(`/api/restaurants/${id}`)
    .then(rejectNon200)
    .then(handleAsJson)
    .then(cacheInIdb('restaurants'))
    .then(returnOrThrow(`Restaurant id ${id} does not exist`));

export const putFavorite = ({ restaurant_id, is_favorite }) => {
  const method = 'PUT';
  return fetch(`/api/restaurants/${restaurant_id}?is_favorite=${!!is_favorite}`, { method })
    .then(rejectNon200)
    .then(handleAsJson)
    .then(returnOrThrow(`Couldn't update favorite status for restaurant ${restaurant_id}:`));
};

export const postReview = ({ comments, name, rating, restaurant_id }) => {
  const method = 'POST';
  const headers = {'Content-Type': 'application/json'};
  const body = JSON.stringify({ comments, name, rating, restaurant_id });
  return fetch('/api/reviews', { method, headers, body })
    .then(rejectNon200)
    .then(handleAsJson)
    .then(returnOrThrow(`Couldn't post review for restaurant ${restaurant_id}:`));
};

export const putReview = ({ comments, name, rating, review_id }) => {
  const method = 'PUT';
  const headers = {'Content-Type': 'application/json'};
  const body = JSON.stringify({ comments, name, rating });
  return fetch(`/api/reviews/${review_id}`, { method, headers, body })
    .then(rejectNon200)
    .then(handleAsJson)
    .then(returnOrThrow(`Couldn't update review ${review_id}:`));
};

export const deleteReview = ({ comments, name, rating, review_id }) => {
  const method = 'DELETE';
  const headers = {'Content-Type': 'application/json'};
  const body = JSON.stringify({ comments, name, rating, review_id });
  fetch(`/api/reviews/${review_id}`, { method, headers, body })
    .then(rejectNon200)
    .then(handleAsText)
    .then(returnOrThrow(`Couldn't delete review ${review_id}:`));
};
