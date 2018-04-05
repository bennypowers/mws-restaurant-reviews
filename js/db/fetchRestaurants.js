import { cacheInIdb, getCachedResponses } from './cacheRequest.js';

import { filter, handleAsJson, identity, rejectNon200 } from '../lib.js';

const _fetchRestaurants = () =>
  fetch('/api/restaurants')
    .then(rejectNon200)
    .then(handleAsJson)
    .then( cacheInIdb('restaurants') );

/** Fetch all restaurants */
// fetchRestaurants :: () -> Promise rs
export const fetchRestaurants = () =>
  Promise.all( getCachedResponses('restaurants') )
    .then(filter(identity))
    .then(x => x.length ? x : _fetchRestaurants());
