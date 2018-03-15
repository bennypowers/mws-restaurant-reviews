// NOTE: In real life, I would use an FP library like Crocks or Ramda.

/*
 * PREDICATES
 */

/** Loose equality. */
// eq :: a -> b -> bool
export const eq = a => b => a == b;

/** Strict equality. */
// eqeq :: a -> b -> bool
export const eqeq = a => b => a === b;

/** Returns unique values for a key in a list of objects. */
// uniqueByKey :: s -> obj -> bool
export const uniqueByKey = key => compose(uniq, map(prop(key)));

/*
 * COMBINATORS
 */

/** Compose functions right-to-left */
// compose :: fs -> g
export const compose = (...fns) =>
  fns.reduce((f, g) => (...args) => f(g(...args)));

/** True when both predicates are true. Naive implementation cribbed from Ramda. */
// and :: (f, g) -> bool
export const and = (f, g) => function _and() {
  // the much-maligned `arguments` object gives us a leg up here.
  return f.apply(this, arguments) && g.apply(this, arguments);
};

/*
 * ARRAY FUNCTIONS
 */

/** Makes array methods point-free. */
// safeArrayMethod :: m -> f -> as -> b
export const safeArrayMethod = name => f => as =>
  (as && as[name] && typeof as[name] === 'function' ? as : [])[name](f);

/** Point-free array map. Naive implementation. */
// map :: f -> as -> bs
export const map = safeArrayMethod('map');

/** Point-free array some. Naive implementation. */
// some :: f -> as -> as
export const some = safeArrayMethod('some');

/** Point-free array find. Naive implementation. */
// find :: f -> as -> a
export const find = safeArrayMethod('find');

/** Point-free array filter. Naive implementation. */
// find :: f -> as -> as
export const filter = safeArrayMethod('filter');

/** Removes duplicates from an array. Naive implementation. */
// uniq :: as -> as
export const uniq = compose(Array.from, x => new Set(x));

/*
 * POJO FUNCTIONS
 * Functions for dealing with Plain Old JavaScript Objects
 */

 /** Returns a property by key, or by dot-separated deep keys. */
 // prop :: str -> obj -> a
 export const prop = propertyName => o =>
   propertyName
     .split('.')
     .reduce((a, b) => a[b], o || {});

/*
 * STRING FUNCTIONS
 */

/** Point-free string trim. Naive implementation. */
// trim :: s -> s
export const trim = trimmable => (trimmable.trim ? trimmable : '').trim();

/**
 * Returns part of a GUID-like pseudo-random string.
 * See https://stackoverflow.com/questions/6860853/generate-random-string-for-div-id
 **/
// S4 :: () -> str
const S4 = () => (((1+Math.random())*0x10000)|0).toString(16).substring(1);

/** Generates a GUID-like pseudo-random string. */
// guid :: () -> str
const guid = () => `${S4()}${S4()}-${S4()}-${S4()}-${S4()}-${S4()}${S4()}${S4()}`;

/** Converts a restaurant name to a (hopefully) unique ID. */
// nameToId :: s -> s
export const nameToId = name =>
  typeof name !== 'string' ||
  name === '' ?
      guid()
    : name
      .trim()
      .toLowerCase()
      .replace(/\W+/g, '');

/*
 * LOGGING FUNCTIONS
 */

/**
 * Logs a message with a tag to the console
 * @param  {string} tag
 * @return {Function} function that logs and then returns an message.
 */
export const trace = tag => message =>
  (console.log(tag, message), message); // eslint-disable-line no-console

/**
 * Logs an error with a tag to the console
 * @param  {string} tag
 * @return {Function} function that logs and then returns an error.
 */
export const traceError = tag => message =>
  (console.error(tag, message), message); // eslint-disable-line no-console

/*
 * PROMISE HELPERS
 */

/**
 * Rejects a response which does not have a 200-series status code
 * @param  {Response} response
 * @return {Promise<Response>}
 */
export const rejectNon200 = response =>
  response.status < 200 || response.status > 300
    ? Promise.reject(new Error(response.statusText || `Request failed. Returned status of ${response.status}`))
    : Promise.resolve(response);

/**
 * Parses a response as JSON
 * @param  {Response} response
 * @return {any}      JSON-parsed response
 */
export const handleAsJson = response => response.json();

/**
 * Parses a response as Text
 * @param  {Response} response
 * @return {any}      Text response
 */
export const handleAsText = response => response.text();

/**
 * Helper function used to reject promise chains if final values are falsy.
 * @param  {String} message error message if result is falsey
 * @return {any}    return value
 */
export const returnOrThrow = message => value => {
  if (value) return value;
  else throw new Error(message);
};

/*
 * DOM HELPERS
 */

/**
 * Get a parameter by name from page URL.
 */
export const getParameterByName = (name, urlString) =>
  // URL constructor obviates need to parse urls ourselves.
  (new URL(urlString || window.location.href))
    .searchParams
    .get(name);

/** Generates a CustomEvent. Reduces boilerplate. */
// customEvent :: (str, o) -> CustomEvent o
export const customEvent = (type, detail) => new CustomEvent(type, {
  bubbles: true, composed: true, detail
});

/** Point-free DOM append. */
// append :: DOM -> DOM -> ()
export const append = parent => child => parent.append(child);

/** Point-free DOM remove. */
// remove :: DOM -> DOM -> ()
export const remove = element => element.remove();
