var map = L.map('map').setView([51.505, -0.09], 13);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

var layerControl = L.control.layers();
layerControl.addTo(map);
var bounds = map.getBounds();
var cells_layers = {};

var cells = {};

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
        bounds = layer.getBounds();
        map.fitBounds(bounds);
        layerControl.addOverlay(layer, layername);
        map.setView(group.getBounds().getCenter());
        if (data['type'] === 'FeatureCollection') {
            var layer = L.geoJson(data,{
            style: function (feature) {
                return {color: feature.properties.color};
            }
        }).bindPopup(function (layer) {
            return "name: "+layer.feature.properties.name;
        });
            data['features'].forEach(feat => {
                var layer_feature = L.geoJson(feat,{
                    style: function (feat) {
                        return {color: feat.properties.color};
                    }
                }).bindPopup(function (layer) {
                    return "name: "+layer.feature.properties.name;
                });
                loadCell(layer_feature.getBounds().getCenter(), "Cell in "+feat.properties.name);

            });
        }
        // layerControl.addOverlay(cells_layers, "cells");

    });
}

loadGeoJson("data/biotopes/biotope_1.json", "Biotop 1");
loadGeoJson("data/areas/ustorp_1_6.json", "Fastighet Ustorp 1:6");

function loadCell(center, name) {
    var key = S2.latLngToKey(center.lat, center.lng, 16);
    console.log(key, cells);
    if(cells[key]) {
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
    cells_layers[name] = layer;

}
