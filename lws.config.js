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
  port: process.env.PORT,
  http2: true,
  compress: true,
  mocks: 'restaurant-mocks.js',
  logFormat: 'stats',
};
