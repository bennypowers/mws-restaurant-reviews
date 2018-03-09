(function() {
  'use strict';

const link = document.createElement('link')
      link.rel = 'stylesheet';
      link.href = 'css/styles.css';
document.head.appendChild(link);

async function loadReviews(id) {
  const { fetchReviews } = await import('/js/dbhelper.js');
  const { trace, traceError } = await import('/js/lib.js');
  const { fillReviewsHTML, resetReviewsHTML } = await import('/js/restaurant_info.js');

  resetReviewsHTML();

  return fetchReviews(id)
    .then(fillReviewsHTML)
    .catch(traceError('fetchRestaurantFromURL'));
}

async function initMap() {
  const {
    fetchRestaurantFromURL,
    fillBreadcrumb,
    fillMapForRestaurant,
    fillRestaurantHTML,
    fillRestaurantHoursHTML,
    getParameterByName,
  } = await import('/js/restaurant_info.js');

  const { trace, traceError } = await import('/js/lib.js');

  const id = getParameterByName('id');

  fetchRestaurantFromURL(id)
    .then(fillRestaurantHTML)
    .then(fillRestaurantHoursHTML)
    .then(fillMapForRestaurant)
    .then(fillBreadcrumb)

  loadReviews(id)
};

async function submitReview() {
  const ironForm = document.getElementById('iron-form');
  const nameEl = document.getElementById('name-input');
  const ratingEl = document.getElementById('rating-input');
  const commentsEl = document.getElementById('comments-input');

  const name = nameEl.value;
  const rating = ratingEl.value;
  const comments = commentsEl.value;

  const resetForm = () => {
    [nameEl, commentsEl].forEach(l => l.value = null);
    ratingEl.value = 0;
    spinner.active = false;
    form.style.opacity = 1;
  };

  if (ironForm.validate()) {
    const { getParameterByName } = await import('/js/restaurant_info.js');
    const { postReview } = await import('/js/dbhelper.js');

    const restaurant_id = getParameterByName('id');

    form.style.opacity = 0;
    spinner.active = true;

    const review = await postReview({comments, name, rating, restaurant_id});

    resetForm();

    dialog.close(review);

    loadReviews(restaurant_id);
  }
}

function openModal() {
  return dialog.showModal();
}

function closeModal() {
  return dialog.close();
}

document
  .getElementById('form-fab')
  .addEventListener('click', openModal)

document
  .getElementById('cancel-button')
  .addEventListener('click', closeModal);

document
  .getElementById('submit-button')
  .addEventListener('click', submitReview);

window.initMap = initMap;
}());
