
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
