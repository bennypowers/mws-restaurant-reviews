import { fetchReviews } from './db/fetchReviews.js';
import { appendTemplateResult, trace } from './lib.js';
import { html } from '../node_modules/lit-html/lib/lit-extended.js';
import './review-card.js';
import './submit-review.js';
import './restaurant-view.el.js';

// TODO: general card element
const reviewCard = ({comments, createdAt, id, updatedAt, name, rating}) =>
  html`<review-card id="${ id }"
      comments="${ comments }"
      createdAt="${ createdAt }"
      updatedAt="${ updatedAt }"
      name="${ name }"
      rating="${ rating }"
  ></review-card>`;

const reviewsList = reviews =>
    !Array.isArray(reviews) ? html`There was a problem showing the reviews. Please try again.`
  : !reviews.length ? html`<p>No Reviews Yet!</p>`
  : reviews.map(reviewCard);

// "optimistic UI"
const onReviewSubmitted = component => event =>
  appendTemplateResult(
    document.getElementById('restaurant'),
    reviewCard(event.detail)
  );

export const restaurantView = ({ online, restaurantId, restaurant = {} }) => html`
  <restaurant-view id="restaurant"
      restaurant="${ restaurant }"
      on-review-submitted="${ onReviewSubmitted(this) }">
    ${ !restaurantId ? Promise.resolve([]) :
      fetchReviews(restaurantId)
        .then(reviewsList)
        .catch(trace('fetchReviews')) }
  </restaurant-view>
`;
