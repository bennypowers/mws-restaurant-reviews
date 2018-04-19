import { cacheInIdb } from './cacheRequest.js';

import { handleAsJson, rejectNon200, returnOrThrow } from '../lib.js';

const method = 'POST';
const headers = { 'Content-Type': 'application/json' };

const makeOptions = review => ({
  body: JSON.stringify(review),
  method,
  headers,
});

export const postReview = review =>
  fetch('/api/reviews', makeOptions(review))
    .then(rejectNon200)
    .then(handleAsJson)
    .then(returnOrThrow(`Couldn't post review for restaurant ${review.restaurant_id}:`))
    .then(cacheInIdb('reviews'));
