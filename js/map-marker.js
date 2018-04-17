/** Restaurant page URL. */
// urlForRestaurant :: str -> str
export const urlForRestaurant = ({id}) =>
  `/restaurant?id=${id}`;

/** Restaurant image URL. */
// imageUrlForRestaurant :: str -> str
export const imageUrlForRestaurant = restaurant =>
  restaurant && restaurant.photograph ? `/img/${restaurant.photograph}.jpg` : '';

/** Adds a map marker to a google map */
// mapMarker :: o -> p -> q
export const mapMarker = map => restaurant => {
  if (!restaurant) return;
  const animation = google.maps.Animation.DROP;
  const position = restaurant.latlng;
  const title = restaurant.name;
  const url = urlForRestaurant(restaurant);
  const marker = new google.maps.Marker({ animation, position, title, url, map });
        marker.addListener('click', () => window.location = url);
  return marker;
};

const nullifyMap = marker => marker.setMap(null);

export const addMarkers = ({ map, restaurants = [], markers = [] }) =>
  window.google ? (
    markers.forEach(nullifyMap),
    window.markers = restaurants.map( mapMarker(map) )
  ) : null;

const swapMaps = () => {
  const map = document.getElementById('good-map');
  map.style.opacity = 1;
};

export const onGoogleMapReady = ({ markers, restaurants }) => ({ detail: map }) => (
  requestIdleCallback(swapMaps),
  addMarkers({ map, restaurants, markers })
);
