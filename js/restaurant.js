{
const link = document.createElement('link')
      link.rel = 'stylesheet';
      link.href = 'css/styles.css';
document.head.appendChild(link);

const fab = document.getElementById('form-fab');
const dialog = document.getElementById('form-dialog');
const submit = document.getElementById('submit-button');
const form = document.getElementById('form');

fab.addEventListener('click', () => {
  dialog.showModal();
})

submit.addEventListener('click', async function submitReview() {
  const form = document.getElementById('form');
  const spinner = document.getElementById('spinner');
  const nameEl = document.getElementById('name-input');
  const ratingEl = document.getElementById('rating-input');
  const commentsEl = document.getElementById('comments-input');

  const name = nameEl.value;
  const rating = ratingEl.value;
  const comments = commentsEl.value;

  const { getParameterByName } = await import('/js/restaurant_info.js');
  const { postReview } = await import('/js/dbhelper.js');

  const restaurant_id = getParameterByName('id');

  form.style.opacity = 0;
  spinner.active = true;

  const review = await postReview({comments, name, rating, restaurant_id});

  form.style.opacity = 1;

  dialog.close();

  loadReviews(restaurant_id);
})
}

async function loadReviews(id) {
  const { fetchReviews } = await import('/js/dbhelper.js');
  const { trace, traceError } = await import('/js/lib.js');
  const { fillReviewsHTML, resetReviewsHTML } = await import('/js/restaurant_info.js');

  resetReviewsHTML();

  return fetchReviews(id)
    .then(trace('fetchReviews'))
    .then(fillReviewsHTML)
    .then(trace('fillReviewsHTML'))
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
