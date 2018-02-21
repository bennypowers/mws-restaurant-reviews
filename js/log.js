/**
 * Logs a message with a tag to the console
 * @param  {string} tag
 * @return {Function} function that logs and then returns an message.
 */
export const trace = tag =>
  message => (console.log(tag, message), message); // eslint-disable-line no-console

/**
 * Logs an error with a tag to the console
 * @param  {string} tag
 * @return {Function} function that logs and then returns an error.
 */
export const traceError = tag =>
  message => (console.error(tag, message), message); // eslint-disable-line no-console
