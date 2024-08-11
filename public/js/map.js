console.log('Mapbox token:', mapToken);
console.log('Listing geometry:', listing.geometry.coordinates);

mapboxgl.accessToken = mapToken;

const map = new mapboxgl.Map({
    container: 'map',
    center: listing.geometry.coordinates, // ensure these coordinates are correct
    zoom: 9
});

const marker = new mapboxgl.Marker({ color: "black" })
    .setLngLat(listing.geometry.coordinates)
    .setPopup(new mapboxgl.Popup({ offset: 25 })
        .setHTML(`<h4>${listing.title}</h4><p>Exact location will be provided after booking</p>`)
    )
    .addTo(map);

console.log('Map and marker initialized');
