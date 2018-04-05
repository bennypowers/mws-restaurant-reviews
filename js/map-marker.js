/** Restaurant page URL. */
// urlForRestaurant :: str -> str
export const urlForRestaurant = ({id}) =>
  `/restaurant?id=${id}`;

/** Restaurant image URL. */
// imageUrlForRestaurant :: str -> str
export const imageUrlForRestaurant = restaurant =>
  restaurant && restaurant.photograph ? `/img/${restaurant.photograph}.jpg` : '';

export const mapMarker = map => restaurant => {
  if (!restaurant) return;
  const animation = google.maps.Animation.DROP;
  const position = restaurant.latlng;
  const title = restaurant.name;
  const url = urlForRestaurant(restaurant);
  const marker =
    new google.maps.Marker({ animation, position, title, url, map });
  marker.addListener('click', () => window.location = urlForRestaurant(restaurant));
  return marker;
};

export const addMarkers = ({map, restaurants = [], markers = []}) => {
  if (!window.google) return;
  markers.forEach(m => m.setMap(null));
  window.markers = restaurants.map( mapMarker(map) );
};
