var baseMap = L.tileLayer('http://a.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
});

var buoys = L.tileLayer('http://t1.openseamap.org/seamark/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="http://www.openseamap.org">OpenSeaMap</a> contributors'
});

var map = L.map('mapdiv', {
    layers: [baseMap]
}).setView([48.370954, -4.480665], 13);


baseLayers = {
    "Fond de carte": baseMap
}
overlays = {
    "Bouées": buoys
}
L.control.layers(baseLayers, overlays).addTo(map);
map.attributionControl.setPrefix(false);


var myMovingMarker = new L.marker([48.370954, -4.480665]).addTo(map);
/*
m.slideTo([48.864433, 2.371324], {
    duration: 3000
});

// or just set rotation with method
m.setRotationAngle(65);*/
/*
var marker = new L.marker(curLocation, {
    draggable: 'true'
});

marker.on('dragend', function (event) {
    var position = marker.getLatLng();
    marker.setLatLng(position, {
        draggable: 'true'
    }).bindPopup(position).update();
    console.log(position);
});*/

//map.addLayer(marker);