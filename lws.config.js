module.exports = {
  stack: [
    'lws-body-parser',
    'lws-request-monitor',
    'lws-log',
    'lws-compress',
    'lws-mock-response',
    'lws-static',
    'lws-cors',
    // 'lws-range',
    // 'lws-mime',
    // 'lws-basic-auth',
    // 'lws-json',
    // 'lws-rewrite',
    // 'lws-blacklist',
    // 'lws-conditional-get',
    // 'lws-spa',
    // 'lws-index' ,
  ],
  server: 'http2',
  mocks: 'restaurant-mocks.js',
  logFormat: 'stats'
};
