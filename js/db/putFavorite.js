import { handleAsJson, rejectNon200, returnOrThrow } from '../lib.js';

import { cacheInIdb } from './cacheRequest.js';

const method = 'PUT';

export const putFavorite = ({ restaurant_id, is_favorite }) =>
  (is_favorite == null || restaurant_id == null) ? undefined :
  fetch(`/api/restaurants/${restaurant_id}?is_favorite=${!!is_favorite}`, { method })
    .then(rejectNon200)
    .then(handleAsJson)
    .then(returnOrThrow(`Couldn't update favorite status for restaurant ${restaurant_id}:`))
    .then( cacheInIdb('restaurants') );
