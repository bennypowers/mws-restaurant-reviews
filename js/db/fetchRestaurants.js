import { cacheInIdb, getCachedResponses } from './cacheRequest.js';

import { filter, handleAsJson, identity, rejectNon200 } from '../lib.js';

const _fetchRestaurants = () =>
  fetch('/api/restaurants')
    .then(rejectNon200)
    .then(handleAsJson)
    .then( cacheInIdb('restaurants') );

const returnResultsOrFetch = results =>
    results.length ? results
  : _fetchRestaurants();

/** Fetch all restaurants */
// fetchRestaurants :: () -> Promise rs
export const fetchRestaurants = () =>
  Promise.all( getCachedResponses('restaurants') )
    .then(filter(identity))
    .then(returnResultsOrFetch);
