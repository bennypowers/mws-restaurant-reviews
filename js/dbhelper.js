import idbKeyval from './idb-keyval.js';
import { handleAsJson, handleAsText, rejectNon200, returnOrThrow, trace } from './lib.js';

// cacheInIdb :: String -> d -> Promise undefined
const cacheInIdb = key => value => {
  const setKv = i => idbKeyval.set(`${key}/${i.id}`, i);
  const promise = Array.isArray(value)
    ? Promise.all(value.map(setKv))
    : idbKeyval.set(key, value);
  return promise.then(() => value);
}


/** Fetch all restaurants */
// fetchRestaurants :: () -> Promise rs
export const fetchRestaurants = () =>
  fetch('/api/restaurants')
    .then(rejectNon200)
    .then(handleAsJson)
    .then(cacheInIdb('restaurants'))

/** Fetch reviews by restaurant id. */
// fetchReviews :: () -> Promise rs
export const fetchReviews = restaurant_id =>
  fetch(`/api/reviews/${restaurant_id ? `?restaurant_id=${restaurant_id}` : ''}`)
    .then(rejectNon200)
    .then(handleAsJson)

/** Fetch a restaurant by its ID. */
// fetchRestaurantById :: str -> Promise r
export const fetchRestaurantById = (id) =>
  fetch(`/api/restaurants/${id}`)
    .then(rejectNon200)
    .then(handleAsJson)
    .then(returnOrThrow(`Restaurant id ${id} does not exist`));

export const putFavorite = ({ restaurant_id, is_favorite }) => {
  const method = 'PUT';
  return fetch(`/api/restaurant/${restaurant_id}?is_favorite=${!!is_favorite}`, { method })
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
