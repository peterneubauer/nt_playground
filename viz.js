var map = L.map('map').setView([51.505, -0.09], 13);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

var layerControl = L.control.layers();
layerControl.addTo(map);

function loadGeoJson(location, layername) {
    $.getJSON( location, function( data ) {
        console.log(data);
        var layer = L.geoJson(data,{
            style: function (feature) {
                return {color: feature.properties.color};
            }
        }).bindPopup(function (layer) {
            return "name: "+layer.feature.properties.name;
        });
        var group = new L.featureGroup([layer]);
        layer.addTo(map);
        map.fitBounds(group.getBounds());
        layerControl.addOverlay(layer, layername);
    });
}

loadGeoJson("data/biotopes/biotope_1.json", "Biotop 1");
loadGeoJson("data/areas/ustorp_1_6.json", "Fastighet Ustorp 1:6");
