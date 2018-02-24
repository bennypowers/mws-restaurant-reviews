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

/** Point-free array map. Naive implementation. */
// map :: f -> as -> bs
export const map = f => arr => arr.map(f);

/** Point-free array filter. Naive implementation. */
// find :: f -> as -> as
export const filter = f => arr => arr.filter(f);

/** Point-free array find. Naive implementation. */
// find :: f -> as -> a
export const find = f => arr => arr.find(f);

/** Removes duplicates from an array. Naive implementation. */
// uniq :: as -> as
export const uniq = compose(Array.from, x => new Set(x));

/*
 * POJO FUNCTIONS
 * Functions for dealing with Plain Old JavaScript Objects
 */

/** Returns a property by key */
// prop :: str -> obj -> a
export const prop = name => o => o[name];

/*
 * STRING FUNCTIONS
 */

/** Point-free string trim. Naive implementation. */
// trim :: s -> s
export const trim = str => str.trim();

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
 * Helper function used to reject promise chains if final values are falsy.
 * @param  {String} message error message if result is falsey
 * @return {any}    return value
 */
export const returnOrThrow = message => value => {
  if (value) return value;
  else throw new Error(message);
};
