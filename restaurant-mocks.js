const { restaurants, reviews } = require('./data.json');

const byFavorite = x => x.is_favorite === true
const byId = id => x => x.id === Number(id);
const byRestaurantId = id => x => x.restaurant_id === Number(id);

module.exports = MockBase => class RestaurantMocks extends MockBase {
  mocks(options) {
    return [
      {
        route: '/api/restaurants',
        responses: {
          request: { method: 'GET' },
          response(ctx) {
            const {is_favorite} = ctx.request.query;
            ctx.body = restaurants.filter(is_favorite ? byFavorite : x => x);
          },
        },
      },
      {
        route: '/api/restaurants/:id',
        responses: [{
            request: { method: 'GET' },
            response(ctx, id) {
              ctx.body = restaurants.filter(byId(id)).pop();
            },
          }, {
            request: { method: 'PUT' },
            response(ctx, id) {
              const {is_favorite} = ctx.request.query;
              const restaurant = restaurants.find(byId(id))
              // mutate the record. parse query string as bool
              restaurant.is_favorite = is_favorite == 'false' ? false : true;

              ctx.body = restaurant;
            },
          }],
      },
      {
        route: '/api/reviews',
        responses: [{
            request: { method: 'GET' },
            response(ctx) {
              const {restaurant_id} = ctx.request.query;
              ctx.body = reviews
                .filter(restaurant_id ? byRestaurantId(restaurant_id) : x => x);
            },
          }, {
            request: { method: 'POST' },
            async response(ctx) {
              // timestamp the review
              const createdAt = Date.now();
              const updatedAt = createdAt;

              // create a new ID
              const id = Math.max(...reviews.map(r => r.id)) + 1;

              const parseReview = ({comments, name, rating, restaurant_id}) => ({
                comments,
                name,
                rating: Number(rating),
                restaurant_id: Number(restaurant_id)
              });

              // create a review entry
              const review = { ...parseReview(ctx.request.body), id, createdAt, updatedAt };

              // 'write' the review to the 'database'
              reviews.push(review);

              await new Promise((res) => setTimeout(res, Math.random() * 800))

              // respond with the new review obj
              ctx.body = review;
            }
          }],
      },
      {
        route: '/api/reviews/:id',
        responses: [{
            request: { method: 'GET' },
            response(ctx, id) {
              ctx.body = reviews.find(byId(id));
            },
          }, {
            request: { method: 'DELETE' },
            response(ctx, id) {
              const review = reviews.find(byId(id));

              // mutate the 'database'
              reviews.splice(reviews.indexOf(review), 1);

              ctx.body = `Deleted review ${id}`;
            },
          }, {
            request: { method: 'PUT' },
            response(ctx, id) {
              const { name, comments, rating } = ctx.request.body;

              // get a handle on the oldRecord
              const oldRecord = reviews.find(byId(id));

              // create a new timestamp
              const updatedAt = Date.now();

              // update the review in the 'database'
              const review = { ...oldRecord, ...ctx.request.body, updatedAt }

              // mutate the 'database'
              reviews.splice(reviews.indexOf(oldRecord), 1, review);

              ctx.body = review
            },
          }]
      }
    ];
  }
};
