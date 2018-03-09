{
  const link = document.createElement('link')
        link.rel = 'stylesheet';
        link.href = 'css/styles.css';
  document.head.appendChild(link);
}

window.restaurants = window.restaurants || undefined;
window.neighborhoods = window.neighborhoods || undefined;
window.cuisines = window.cuisines || undefined;
window.map = window.map || undefined;
window.markers = window.markers || [];

/**
 * Deferred module loading and google maps async attr were causing a race-
 * condition for initMap. A nice solution is to use the dynamic `import()`
 * function-like keyword, which is accessible from scripts as well as modules.
 */
async function initMap() {
  const {append} = await import('/js/lib.js');

  const {
    createOption,
    renderMap,
    uniqueCuisines,
    uniqueNeighborhoods,
    updateRestaurants,
  } = await import('/js/main.js');

  /**
   * Fetch neighborhoods and cuisines as soon as the page is loaded.
   * Update restaurants when user makes a selection.
   */
  document.addEventListener('restaurants-fetched', ({detail: {restaurants}}) => {
    const neighborhoodsSelect = document.getElementById('neighborhoods-select');
    const cuisinesSelect = document.getElementById('cuisines-select');

    // Update the restaurant list when user selects a filter
    neighborhoodsSelect.addEventListener('change', () => updateRestaurants(self.restaurants));
    cuisinesSelect.addEventListener('change', () => updateRestaurants(self.restaurants));

    uniqueNeighborhoods(restaurants)
      .map(createOption)                  // [options]
      .map(append(neighborhoodsSelect));  // side effect

    uniqueCuisines(restaurants)
      .map(createOption)              // [options]
      .map(append(cuisinesSelect)); // side effect
  });

  renderMap();

}
