import idbKeyval from '../idb-keyval.js';

import {
  asArray,
  compose,
  constant,
  handleAsJson,
  handleAsText,
  rejectNon200,
  trace,
  uniq,
} from '../lib.js';

/** get and parse JSON from localStorage. */
const parseLocalStorageJson = key =>
  JSON.parse(localStorage.getItem(key));

/** Get cached responses from idb. */
// getCachedResponses :: str -> [Promise response]
export const getCachedResponses = type =>
  ( parseLocalStorageJson(`idb-cached-${type}-ids`) || [] )
    .map( getKeyValFromIdb(type) );

/** store the id of a restaurant or review in localStorage. */
export const storeId = key => value => {
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
export const setKeyValInIdb = key => value =>
  idbKeyval.set( value.id ? `${key}/${value.id}` : `${key}`, value );

/** Stores an id in localStorage then caches the response in idb. */
// storeAndCache :: str -> response -> Promise undefined
export const storeAndCache = key => compose(
  setKeyValInIdb(key),
  storeId(`idb-cached-${key}-ids`)
);

/** get an id-keyed value from idb. */
// getKeyValFromIdb :: key -> value -> Promise a
export const getKeyValFromIdb = key => compose(
  idbKeyval.get,
  x => `${key}/${x}`,
);

/** Cache a response in idb. */
// cacheInIdb :: String -> d -> Promise value
export const cacheInIdb = key => value =>
  Promise.all(
    asArray(value)
      .map( storeAndCache(key) )
  ).then( constant(value) );
const appendRequest = (key, value) => (pendingRequests = []) => {
  const newPending = [...pendingRequests, value];
  return idbKeyval
    .set(key, newPending)
    .then(constant(value.request.body));
};

export const cacheRequest = (key, value) => {
  return idbKeyval
    .get(key)
    .then(appendRequest(key, value));
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
