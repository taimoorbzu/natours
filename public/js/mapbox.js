/* eslint-disable */
export const displayMap = locations => {
  // Note: Put your free Mapbox Public Token from https://account.mapbox.com here:
  mapboxgl.accessToken =
    'pk.eyJ1IjoidGFtb3JtaXJ4YSIsImEiOiJjbXY1Y2lyc2gwNTI2MnhyNG9seTNqbHQ2In0.JL7xntfmCUHrlwQdjF_TBg';

  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/outdoors-v12',
    scrollZoom: false,
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach(loc => {
    // Create marker
    const el = document.createElement('div');
    el.className = 'marker';

    // Add marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom'
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    // Add popup
    new mapboxgl.Popup({
      offset: 30
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    // Extend map bounds to include current location
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100
    },
    maxZoom: 10
  });

  // Add zoom and rotation controls (+ / - buttons)
  map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');
};

const mapBox = document.getElementById('map');
if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}
