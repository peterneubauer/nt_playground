var map = L.map('map').setView([51.505, -0.09], 13);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

var layerControl = L.control.layers();
layerControl.addTo(map);
var bounds = map.getBounds();
var cells_layers = {};
var cell_control_layers = [];

var cells_by_key = {};

async function loadGeoJson(location, layername) {
    await fetch(location)
        .then(response => response.json())
        .then(data => {
                console.log(data);
                var layer = L.geoJson(data,{
                    style: function (feature) {
                        return {color: feature.properties.color};
                    }
                })
                .bindPopup(function (layer) {
                    console.log(layer.feature.properties);
                    return JSON.stringify(layer.feature.properties);
                });
                layer.addTo(map);
                bounds = layer.getBounds();
                map.fitBounds(bounds);
                layerControl.addOverlay(layer, layername);
                map.setView(bounds.getCenter());
                data['features'].forEach(feat => {
                    var layer_feature = L.geoJson(feat);
                    loadCell(layer_feature.getBounds().getCenter(), "Cell in "+feat.properties.name);

                });
        })
        .catch(error => {
            console.error('Error loading GeoJSON data:', error);
        });
}

async function getData() {
    await loadGeoJson("data/biotopes/biotope_1.json", "Biotop 1");
    await loadGeoJson("data/areas/ustorp_1_6.json", "Fastighet Ustorp 1:6");

}

function loadCell(center, name) {
    var key = S2.latLngToKey(center.lat, center.lng, 16);
    console.log(key, cells_by_key);
    if(cells_by_key[key]) {
        console.log("found cell already");
    }
    var corners = S2.S2Cell.FromLatLng(center, 16).getCornerLatLngs();
    coordinates = [];
    corners.forEach(corner => {
        coordinates.push([corner.lng, corner.lat])
    });
    coordinates.push([corners[0].lng, corners[0].lat])
    var geoJson = {
        "type": "Feature",
        "properties": {
           "name": ""+key
       },
       "geometry": { "type": "Polygon", "coordinates": [coordinates
   ]}};
    console.log(corners, geoJson);
    var layer = L.geoJson(geoJson,{
                style: function (feature) {
                    return {color: "red"};
                }
            }).bindPopup(function (layer) {
                return "name: "+name+"<br/>key: "+key;
            });
    layer.addTo(map);
    cell_control_layers.push(layer);
    cells_layers[name] = layer;
    cells_by_key[key] = [geoJson];

}

getData()
    .then(() => {
        const layerGroup = L.layerGroup(cell_control_layers);
        layerControl.addOverlay(layerGroup, "S2 cells");
        console.log("done");

    })
