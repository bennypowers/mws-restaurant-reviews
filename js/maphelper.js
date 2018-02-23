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
