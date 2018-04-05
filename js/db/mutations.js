import { cacheRequest } from './cacheRequest.js';

import { handleAsJson, handleAsText, rejectNon200, returnOrThrow } from '../lib.js';

export const putReview = ({ comments, name, rating, review_id }) => {
  const method = 'PUT';
  const headers = {'Content-Type': 'application/json'};
  const body = JSON.stringify({ comments, name, rating });
  const url = `/api/reviews/${review_id}`;
  const request = { method, headers, body };
  return !navigator.onLine ? cacheRequest('putReview', { url, request })
    : fetch(url, request)
      .then(rejectNon200)
      .then(handleAsJson)
      .then(returnOrThrow(`Couldn't update review ${review_id}:`));
};

export const deleteReview = ({ comments, name, rating, review_id }) => {
  const method = 'DELETE';
  const headers = {'Content-Type': 'application/json'};
  const body = JSON.stringify({ comments, name, rating, review_id });
  const url = `/api/reviews/${review_id}`;
  const request = { method, headers, body };
  return !navigator.onLine ? cacheRequest('deleteReview', { url, request })
    : fetch(url, request)
      .then(rejectNon200)
      .then(handleAsText)
      .then(returnOrThrow(`Couldn't delete review ${review_id}:`));
};
