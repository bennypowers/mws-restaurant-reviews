const {restaurants} = require('./data.json');

module.exports = MockBase => class RestaurantMocks extends MockBase {
  mocks(options) {
    return [
      {
        route: '/api/restaurants',
        responses: {
          request: { method: 'GET' },
          response: {
            body: JSON.stringify(restaurants),
          },
        },
      },
      {
        route: '/api/restaurants/:id',
        responses: {
          request: { method: 'GET' },
          response: (ctx, id) => {
            ctx.body = restaurants.filter(r => r.id == id).pop();
          },
        },
      },
    ];
  }
};
