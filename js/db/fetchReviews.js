import { cacheInIdb, getCachedResponses } from './cacheRequest.js';

import { filter, handleAsJson, identity, rejectNon200 } from '../lib.js';

const _fetchReviews = id =>
  fetch(`/api/reviews/${id ? `?restaurant_id=${id}` : ''}`)
    .then(rejectNon200)
    .then(handleAsJson)
    .then(cacheInIdb('reviews'));

const fetchIfOnline = id => reviews => new Promise((resolve, reject) =>
    reviews.length ? resolve(reviews)
  : !navigator.onLine ? reject(new Error('Cannot fetch reviews: offline'))
  : resolve(_fetchReviews(id)));

/** Fetch reviews by restaurant id. */
// fetchReviews :: () -> Promise rs
export const fetchReviews = id => !id ? Promise.resolve(null) :
  Promise.all( getCachedResponses('reviews') )
    .then( filter(identity) )
    .then( fetchIfOnline(id) );
