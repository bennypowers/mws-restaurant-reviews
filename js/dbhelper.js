import idbKeyval from './idb-keyval.js';
import {
  asArray,
  compose,
  constant,
  filter,
  handleAsJson,
  handleAsText,
  identity,
  rejectNon200,
  returnOrThrow,
  trace,
  uniq,
} from './lib.js';

/** get and parse JSON from localStorage. */
const parseLocalStorageJson = key =>
  JSON.parse(localStorage.getItem(key));

/** store the id of a restaurant or review in localStorage. */
const storeId = key => value => {
  if (value.id == null) return value;
  try {
    const stored = parseLocalStorageJson(key);
    const previous = Array.isArray(stored) ? stored : [];
    const updated = uniq([...previous, value.id]);
    localStorage.setItem(key, JSON.stringify(updated));
  } catch (e) {
    localStorage.setItem(key, JSON.stringify([value.id]));
  }
  return value;
};

/** set an id-keyed value in idb. */
// setKeyValInIdb :: key -> value -> Promise undefined
const setKeyValInIdb = key => value =>
  idbKeyval.set( value.id ? `${key}/${value.id}` : `${key}`, value );

/** get an id-keyed value from idb. */
// getKeyValFromIdb :: key -> value -> Promise a
const getKeyValFromIdb = key => compose(
  idbKeyval.get,
  x => `${key}/${x}`,
);

/** Stores an id in localStorage then caches the response in idb. */
// storeAndCache :: str -> response -> Promise undefined
const storeAndCache = key => compose(
  setKeyValInIdb(key),
  storeId(`idb-cached-${key}-ids`)
);

/** Cache a response in idb. */
// cacheInIdb :: String -> d -> Promise value
const cacheInIdb = key => value =>
  Promise.all(
    asArray(value)
      .map( storeAndCache(key) )
  ).then( constant(value) );

const _fetchRestaurants = () =>
  fetch('/api/restaurants')
    .then(rejectNon200)
    .then(handleAsJson)
    .then( cacheInIdb('restaurants') );

/** Get cached responses from idb. */
// getCachedResponses :: str -> [Promise response]
const getCachedResponses = type =>
  ( parseLocalStorageJson(`idb-cached-${type}-ids`) || [] )
    .map( getKeyValFromIdb(type) );

/** Fetch all restaurants */
// fetchRestaurants :: () -> Promise rs
export const fetchRestaurants = () =>
  Promise.all( getCachedResponses('restaurants') )
    .then(filter(identity))
    .then(x => x.length ? x : _fetchRestaurants());

const _fetchReviews = id =>
  fetch(`/api/reviews/${id ? `?restaurant_id=${id}` : ''}`)
    .then(rejectNon200)
    .then(handleAsJson)
    .then(cacheInIdb('reviews'));

/** Fetch reviews by restaurant id. */
// fetchReviews :: () -> Promise rs
export const fetchReviews = id => !id ? Promise.resolve(null) :
  Promise.all( getCachedResponses('reviews') )
    .then(filter(identity))
    .then(reviews => new Promise((resolve, reject) =>
        reviews.length ? resolve(reviews)
      : !navigator.onLine ? reject(new Error('Cannot fetch reviews: offline'))
      : resolve(_fetchReviews(id))));

const _fetchRestaurantById = id =>
  fetch(`/api/restaurants/${id}`)
    .then(rejectNon200)
    .then(handleAsJson)
    .then(cacheInIdb('restaurants'))
    .then(returnOrThrow(`Restaurant id ${id} does not exist`));

/** Fetch a restaurant by its ID. */
// fetchRestaurantById :: str -> Promise r
export const fetchRestaurantById = id => !id ? Promise.resolve(null) :
  idbKeyval.get(`restaurants/${id}`)
    .then(x => x ? x : _fetchRestaurantById(id));

const appendRequest = (key, value) => (pendingRequests = []) => {
  const newPending = [...pendingRequests, value];
  return idbKeyval
    .set(key, newPending)
    .then(constant(value.request.body));
};

const cacheRequest = (key, value) => {
  return idbKeyval
    .get(key)
    .then(appendRequest(key, value));
};

export const putFavorite = ({ restaurant_id, is_favorite }) => {
  const method = 'PUT';
  const url = `/api/restaurants/${restaurant_id}?is_favorite=${!!is_favorite}`;
  const request = { method };
  return !navigator.onLine ? cacheRequest('putFavorite', { url, request })
    : fetch(url, request)
      .then(rejectNon200)
      .then(handleAsJson)
      .then(returnOrThrow(`Couldn't update favorite status for restaurant ${restaurant_id}:`));
};

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

const notTheResponse = response => request => {
  const review = JSON.parse(request.request.body);
  // We generate IDs on the server, so the only way to be sure that the cached
  // review is not the one from the server is to manually check the relevant props.
  return (
    review.name != response.name &&
    review.comments != response.comments &&
    review.rating != response.rating
  );
};

const updateCachedRequestList = (name, response) => requests => {
  const updatedList = requests.filter( notTheResponse(response) );
  return idbKeyval.set(name, updatedList);
};

const handleOfflineSyncSuccess = name => response => {
  idbKeyval.get(name)
    .then( updateCachedRequestList(name, response) );
};

const catchUp = name => ({url, request}) =>
  fetch(url, request)
    .then(rejectNon200)
    .then(name === 'deleteReview' ? handleAsText : handleAsJson)
    .then( handleOfflineSyncSuccess(name) )
    .catch(trace('catchUp'));

const catchUpRequests = name => (requests = []) =>
  requests.forEach( catchUp(name) );

const syncRequests = name =>
  idbKeyval.get(name)
    .then( catchUpRequests(name) );

export const attemptCatchUp = () => {
  ['putFavorite', 'postReview', 'putReview', 'deleteReview']
    .forEach(syncRequests);
};

window.addEventListener('online', attemptCatchUp);
