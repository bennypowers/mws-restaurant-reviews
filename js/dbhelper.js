import { handleAsJson, rejectNon200, returnOrThrow } from './lib.js';

// Database URL
const DATABASE_URL = `/api/restaurants/`;

/** Perform the network request to get the restaurants. */
// _fetchRestaurants :: () -> Promise rs
const _fetchRestaurants = () =>
  fetch(DATABASE_URL)
    .then(rejectNon200)
    .then(handleAsJson)
    .then(returnOrThrow('Could not fetch restaurants'));

// Fetch all restaurants. Checks first for a cached object.
// fetchRestaurants:: (rs|undefined) -> Promise rs
export const fetchRestaurants = cached =>
  Promise.resolve(Array.isArray(cached) ? cached : _fetchRestaurants());

// Fetch a restaurant by its ID.
// fetchRestaurantById :: str -> Promise r
export const fetchRestaurantById = (id) =>
  fetch(DATABASE_URL + id)
    .then(rejectNon200)
    .then(handleAsJson)
    .then(returnOrThrow(`Restaurant id ${id} does not exist`));
