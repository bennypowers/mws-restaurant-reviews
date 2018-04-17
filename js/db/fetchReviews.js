import { cacheInIdb, getCachedResponses } from './cacheRequest.js';

import { filter, handleAsJson, rejectNon200 } from '../lib.js';

export const syncReviews = id =>
  fetch(`/api/reviews/${id ? `?restaurant_id=${id}` : ''}`)
    .then(rejectNon200)
    .then(handleAsJson)
    .then(cacheInIdb('reviews'));

const fetchIfOnline = id => new Promise((resolve, reject) =>
  !navigator.onLine
    ? reject(new Error('Cannot fetch reviews: offline'))
    : resolve( syncReviews(id) ));

const sameRestaurantId = id => r => r && r.restaurant_id == id;

/** Fetch reviews by restaurant id. */
// fetchReviews :: () -> Promise rs
export const fetchReviews = id =>
    !id ? Promise.resolve(null)
  : Promise.all( getCachedResponses('reviews') )
    .then( filter( sameRestaurantId(id) ) );
