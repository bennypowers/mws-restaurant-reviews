module.exports = {
  stack: [
    'lws-body-parser',
    'lws-request-monitor',
    'lws-log',
    'lws-compress',
    'lws-mock-response',
    'lws-static',
    'lws-cors',
  ],
  server: 'http2',
  mocks: 'restaurant-mocks.js',
  logFormat: 'stats',
};
