import { cacheRequest } from './cacheRequest.js';

import { handleAsJson, rejectNon200, returnOrThrow } from '../lib.js';

export const postReview = review => {
  const method = 'POST';
  const headers = {'Content-Type': 'application/json'};
  const body = JSON.stringify(review);
  const url = '/api/reviews';
  const request = { method, headers, body };
  return !navigator.onLine ? cacheRequest('postReview', { url, request })
    : fetch(url, request)
      .then(rejectNon200)
      .then(handleAsJson)
      .then(returnOrThrow(`Couldn't post review for restaurant ${review.restaurant_id}:`));
};
