import { handleAsJson, rejectNon200, returnOrThrow } from '../lib.js';

import { cacheRequest } from './cacheRequest.js';

export const putFavorite = ({ restaurant_id, is_favorite }) => {
  if (is_favorite == null || restaurant_id == null) return;
  const method = 'PUT';
  const url = `/api/restaurants/${restaurant_id}?is_favorite=${!!is_favorite}`;
  const request = { method };
  return !navigator.onLine ? cacheRequest('putFavorite', { url, request })
    : fetch(url, request)
      .then(rejectNon200)
      .then(handleAsJson)
      .then(returnOrThrow(`Couldn't update favorite status for restaurant ${restaurant_id}:`));
};
