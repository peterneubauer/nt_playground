var map = L.map('map').setView([51.505, -0.09], 13);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

var layerControl = L.control.layers();
layerControl.addTo(map);

function loadGeoJson(location) {
    $.getJSON( location, function( data ) {
        var layer = L.geoJson(data,{
            style: function (feature) {
                return {color: feature.properties.color};
            }
        }).bindPopup(function (layer) {
            return layer.feature.properties.name;
        });
        var group = new L.featureGroup([layer]);
        layer.addTo(map);
        map.fitBounds(group.getBounds());
        layerControl.addOverlay(layer, location);
    });
}

loadGeoJson("data/biotopes/biotope_1.json");
loadGeoJson("data/areas/ustorp_1_6.json");