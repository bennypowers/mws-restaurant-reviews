import { $ } from './lib.js';

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
export const mapMarker = map => ({id, latlng: position, name: title} = {}) => {
  if (!id && !position && !title) return;
  const animation = google.maps.Animation.DROP;
  const url = `/restaurant?id=${ id }`;
  const marker = new google.maps.Marker({ animation, position, title, url, map });
        marker.addListener('click', () => window.location = url);
  return marker;
};

const nullifyMap = marker => marker.setMap(null);

export const addMarkers = ({ map, restaurants = [], markers = [] }) => {
  if (window.google) {
    markers.map(nullifyMap);
    window.markers = restaurants.map( mapMarker(map) );
  }
};

const swapMaps = () =>
  $('#good-map').style.opacity = 1;

export const onGoogleMapReady = ({ markers, restaurants }) => ({ detail: map }) => {
  requestIdleCallback(swapMaps);
  addMarkers({ map, restaurants, markers });
};
