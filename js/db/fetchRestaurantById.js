import { get } from '../../node_modules/idb-keyval/dist/idb-keyval.mjs';
import { cacheInIdb } from './cacheRequest.js';
import { handleAsJson,  rejectNon200, returnOrThrow } from '../lib.js';

const _fetchRestaurantById = id =>
  fetch(`/api/restaurants/${id}`)
    .then(rejectNon200)
    .then(handleAsJson)
    .then(cacheInIdb('restaurants'))
    .then(returnOrThrow(`Restaurant id ${id} does not exist`));

/** Fetch a restaurant by its ID. */
// fetchRestaurantById :: str -> Promise r
export const fetchRestaurantById = id => !id ? Promise.resolve(null) :
  get(`restaurants/${id}`)
    .then(x => x ? x : _fetchRestaurantById(id));
