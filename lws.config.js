module.exports = {
  stack: [
    'lws-body-parser',
    'lws-request-monitor',
    'lws-log',
    'lws-compress',
    'lws-mock-response',
    'lws-static',
    'lws-cors',
    'lws-spa',
  ],
  spa: 'index.html',
  http2: true,
  port: 443,
  apiPrefix: 'api',
  compress: true,
  mocks: 'restaurant-mocks.js',
  logFormat: 'dev',
};
