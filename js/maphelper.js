// titleMap :: (map, title) -> map
export const titleMap = (map, title) =>
  google.maps.event.addListener(map, 'tilesloaded', () => {
    try {
      document
        .getElementById('map')
        .querySelector('iframe')
        .title = title;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('Could not set map title', e);
    }

    return map;
  });

/** Restaurant page URL. */
// urlForRestaurant :: str -> str
export const urlForRestaurant = ({id}) =>
  `./restaurant.html?id=${id}`;

/** Restaurant image URL. */
// imageUrlForRestaurant :: str -> str
export const imageUrlForRestaurant = ({photograph}) =>
  photograph ? `/img/${photograph}.jpg` : '';

/** Map marker for a restaurant. */
// mapMarkerForRestaurant :: (r, m) -> Marker
export const mapMarkerForRestaurant = (restaurant, map) => {
  const position = restaurant.latlng;
  const title = restaurant.name;
  const url = urlForRestaurant(restaurant);
  const animation = google.maps.Animation.DROP;
  return new google.maps.Marker({ animation, map, position, title, url });
};
