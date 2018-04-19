import { get, set } from '../../node_modules/idb-keyval/dist/idb-keyval.mjs';
import { asArray, compose, constant, uniq } from '../lib.js';

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
  set( value.id ? `${key}/${value.id}` : `${key}`, value );

/** Stores an id in localStorage then caches the response in idb. */
// storeAndCache :: str -> response -> Promise undefined
export const storeAndCache = key => compose(
  setKeyValInIdb(key),
  storeId(`idb-cached-${key}-ids`)
);

/** get an id-keyed value from idb. */
// getKeyValFromIdb :: key -> value -> Promise a
export const getKeyValFromIdb = key => compose(
  get,
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
  return set(key, newPending)
    .then(constant(value.request.body));
};

export const cacheRequest = (key, value) => {
  return get(key)
    .then(appendRequest(key, value));
};
