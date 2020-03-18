$("#navMission").addClass("active")

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

// WP List machinery
var el = document.getElementById('wayPointsList');

var sortable = Sortable.create(el, {
    onEnd: function (evt) {
        var itemEl = evt.item;  // dragged HTMLElement
        console.log(itemEl.id, evt.oldIndex, evt.newIndex)
    }
});

var currID = 5;

$(".deleteWP").click(function (event) {
    $(this).closest("li").remove();
});

$(".addWP").click(function (event) {
    $("#wayPointsList").append(
        '<li class="list-group-item" id="id'+ currID + '">Waypoint ' + currID + '<button class="btn btn-danger deleteWP" type="button">-</button></li>'
    );

    currID++;
    $(".deleteWP").click(function (event) {
        $(this).closest("li").remove();
    });
});

$(".submitWP").click(function (event) {
    var wp = [];
    $("#wayPointsList").each(function( index ) {
        console.log( index + ": " + $( this ).text() );
    });

    currID++;
    $(".deleteWP").click(function (event) {
        $(this).closest("li").remove();
    });
});


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