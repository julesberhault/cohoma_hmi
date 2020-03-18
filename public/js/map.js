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

var swapArrayElements = function (arr, indexA, indexB) {
    var temp = arr[indexA];
    arr[indexA] = arr[indexB];
    arr[indexB] = temp;
};

var wayPointsList = []

var sortable = Sortable.create(el, {
    onEnd: function (evt) {
        var itemEl = evt.item;  // dragged HTMLElement
        console.log(itemEl.id, evt.oldIndex, evt.newIndex);
        swapArrayElements(wayPointsList, evt.oldIndex, evt.newIndex);
        updatePath();
    }
});



var updatePath = function () {
    var latlongs = [];
    wayPointsList.forEach(element => {
        latlongs.push(element.latlong);
    });
    polyline.setLatLngs(latlongs);
}

var currID = 5;

var deleteWPf = function (event) {
    var id = $(this).closest("li").attr("id");
    var i = 0;
    var k = 0;
    wayPointsList.forEach(element => {
        if (id == element.id) {
            map.removeLayer(element.marker);
            k = i;
        }
        i++;
    });
    wayPointsList.splice(k, 1);
    $(this).closest("li").remove();
    updatePath();
};



$(".deleteWP").click(deleteWPf);

$(".addWP").click(function (event) {
    $("#wayPointsList").append(
        '<li class="list-group-item" id="id' + currID + '">Waypoint ' + currID + '<button class="btn btn-danger deleteWP" type="button">-</button></li>'
    );

    currID++;
    $(".deleteWP").click(function (event) {
        $(this).closest("li").remove();
    });
});

$(".submitWP").click(function (event) {
    var wp = [];
    $("#wayPointsList").each(function (index) {
        console.log(index + ": " + $(this).text());
    });

    currID++;
    $(".deleteWP").click(function (event) {
        $(this).closest("li").remove();
    });
});

var posShow = function (position) {
    return (Math.trunc(10000 * position.lat) / 10000 + ' : ' + Math.trunc(10000 * position.lng) / 10000)
}

var updateWPList = function (wps) {
    //wps must contain an id and a latlong array at the bare minimum
    wayPointsList.forEach(element => {
        if(element.marker){
            map.removeLayer(element.marker);
        }
    });

    wayPointsList = [];
    wps.forEach(wp => {
        var marker = new L.marker(wp.latlong, {
            draggable: 'true'
        });
        marker.on('dragend', function (event) {
            var position = marker.getLatLng();
            marker.setLatLng(position, {
                draggable: 'true'
            }).update();
            wp.latlong = position;

            document.getElementById(wp.id).childNodes[0].nodeValue = posShow(position);

            updatePath();
        });
        wp.marker = marker;
        map.addLayer(marker);
        wayPointsList.push(wp);
    });
    currID = wps.length;
    $("#wayPointsList").empty();
    wayPointsList.forEach(element => {
        var position = element.marker.getLatLng();
        $("#wayPointsList").append('<li class="list-group-item wpItem" id="' + element.id + '">' + posShow(position) + '<button class="btn btn-danger deleteWP" type="button">-</button></li>');
    });

    $(".deleteWP").click(deleteWPf);
}

wayPointsList = [
    {
        latlong: [48.370954, -4.480665],
        id: "id1",
        currid: 5
    },
    {
        latlong: [48.380, -4.480665],
        id: "id2",
        currid: 5
    },
    {
        latlong: [48.370954, -4.4850],
        id: "id3",
        currid: 5
    },
    {
        latlong: [48.370954, -4.475],
        id: "id4",
        currid: 5
    }
];

updateWPList(wayPointsList);

var polyline = L.polyline([], { color: 'red' }).addTo(map);

updatePath();

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