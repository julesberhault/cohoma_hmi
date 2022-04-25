mapSetted = false;
var selectedSatellite = 0; // 0 is for general
var cycleNumber = 5;
var centeredLocation
var zoomLevel = 18;

var satellite1Pos = {lat: 0., lng: 0., hea: 0.};
var satellite2Pos = {lat: 0., lng: 0., hea: 0.};
var satellite3Pos = {lat: 0., lng: 0., hea: 0.};
var satellite4Pos = {lat: 0., lng: 0., hea: 0.};

// Leaflet.js

var defaultLayer = L.tileLayer('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
	maxZoom: 20,
	attribution: '&copy; OpenStreetMap France | &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

var satelliteLayer = L.tileLayer('https://wxs.ign.fr/{apikey}/geoportail/wmts?REQUEST=GetTile&SERVICE=WMTS&VERSION=1.0.0&STYLE={style}&TILEMATRIXSET=PM&FORMAT={format}&LAYER=ORTHOIMAGERY.ORTHOPHOTOS&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}', {
	attribution: '<a target="_blank" href="https://www.geoportail.gouv.fr/">Geoportail France</a>',
	bounds: [[-75, -180], [81, 180]],
	minZoom: 2,
	maxZoom: 19,
	apikey: 'choisirgeoportail',
	format: 'image/jpeg',
	style: 'normal'
});

var map = L.map('mapdiv', {
    layers: [defaultLayer]
});

// ----- Get Last Location -----
socket.emit("getCenteredLocation");

socket.on("currentCenteredLocation", function(currentCenteredLocation) {
    centeredLocation = currentCenteredLocation;
    map.setView(centeredLocation, zoomLevel);
    mapSetted = true;
});
// -----------------------------

baseLayers = {
    "Default": defaultLayer,
    "Satellite": satelliteLayer,
}
overlays = {
}

L.control.layers(baseLayers, overlays).addTo(map);
L.control.scale({imperial: false, metric: true}).addTo(map);
map.attributionControl.setPrefix(false);

var satellite1Icon = L.icon({
    iconUrl: "../css/images/husky_yellow_arrow.svg",
    iconSize:     [50, 50],
    iconAnchor:   [25, 25],
    popupAnchor:  [0, 0]
});

var satellite1Marker = new L.marker([0, 0], {
    icon: satellite1Icon,
    rotationAngle: 0,
    rotationOrigin: "center center"
});

var satellite2Icon = L.icon({
    iconUrl: "../css/images/husky_lime_arrow.svg",
    iconSize:     [50, 50],
    iconAnchor:   [25, 25],
    popupAnchor:  [0, 0]
});

var satellite2Marker = new L.marker([0, 0], {
    icon: satellite2Icon,
    rotationAngle: 0,
    rotationOrigin: "center center"
});

var satellite3Icon = L.icon({
    iconUrl: "../css/images/anafi_blue_arrow.svg",
    iconSize:     [50, 50],
    iconAnchor:   [25, 25],
    popupAnchor:  [0, 0]
});

var satellite3Marker = new L.marker([0, 0], {
    icon: satellite3Icon,
    rotationAngle: 0,
    rotationOrigin: "center center"
});

var satellite4Icon = L.icon({
    iconUrl: "../css/images/anafi_purple_arrow.svg",
    iconSize:     [50, 50],
    iconAnchor:   [25, 25],
    popupAnchor:  [0, 0]
});

var satellite4Marker = new L.marker([0, 0], {
    icon: satellite4Icon,
    rotationAngle: 0,
    rotationOrigin: "center center"
});

var aerialTrapRedIcon = L.icon({
    iconUrl: "../css/images/aerial_trap_red.svg",
    iconSize:     [40, 40],
    iconAnchor:   [20, 20],
    popupAnchor:  [0, 0]
});

var aerialTrapRedMarker = new L.marker([0, 0], {
    icon: aerialTrapRedIcon,
});

// ROS

var ros = new ROSLIB.Ros({url : 'ws://0.0.0.0:9090'})

var compassListenerSat1 = new ROSLIB.Topic({
    ros : ros,
    name : '/odometry/filtered_map',
    messageType : 'nav_msgs/Odometry'
});

var gpsListenerSat1 = new ROSLIB.Topic({
    ros : ros,
    name : '/gps/filtered',
    messageType : 'sensor_msgs/NavSatFix'
});

var compassListenerSat2 = new ROSLIB.Topic({
    ros : ros,
    name : '/satellite2/sbg/gps_hdt',
    messageType : 'sbg_driver/SbgGpsHdt'
});
var gpsListenerSat2 = new ROSLIB.Topic({
    ros : ros,
    name : '/satellite2/sbg/gps_pos',
    messageType : 'sbg_driver/SbgGpsPos'
});

var compassListenerSat3 = new ROSLIB.Topic({
    ros : ros,
    name : '/satellite3/sbg/gps_hdt',
    messageType : 'sbg_driver/SbgGpsHdt'
});
var gpsListenerSat3 = new ROSLIB.Topic({
    ros : ros,
    name : '/satellite3/sbg/gps_pos',
    messageType : 'sbg_driver/SbgGpsPos'
});

var compassListenerSat4 = new ROSLIB.Topic({
    ros : ros,
    name : '/satellite4/sbg/gps_hdt',
    messageType : 'sbg_driver/SbgGpsHdt'
});
var gpsListenerSat4 = new ROSLIB.Topic({
    ros : ros,
    name : '/satellite4/sbg/gps_pos',
    messageType : 'sbg_driver/SbgGpsPos'
});

compassListenerSat1.subscribe(function(message){
    let qw = message.pose.pose.orientation.w;
    let qx = message.pose.pose.orientation.x;
    let qy = message.pose.pose.orientation.y;
    let qz = message.pose.pose.orientation.z;
    satellite1Pos.hea = 90.0-180.0*Math.atan2(2.0*(qw*qz+qx+qy), 1.0-2.0*(qy*qy+qz*qz))/Math.PI;
    satellite1Marker.setRotationAngle(satellite1Pos.hea/2.0);
    refreshCompass(satellite1Pos.hea);
})
var i1 = 0;
gpsListenerSat1.subscribe(function(message) {
    satellite1Pos.lat = message.latitude;
    satellite1Pos.lng = message.longitude;
    if (mapSetted) {
        if(i1 == 0)
        {
            satellite1Marker.addTo(map).bindPopup("Satellite 1");
            if (selectedSatellite == 1 || selectedSatellite == 0) {
                map.panTo([satellite1Pos.lat, satellite1Pos.lng]);
            }
        }
        if(i1 % cycleNumber == 0)
        {
            satellite1Marker.setLatLng([satellite1Pos.lat, satellite1Pos.lng]);
        }
        i1++;
    }
});

compassListenerSat2.subscribe(function(message){
    satellite2Pos.hea = message.true_heading;
    satellite2Marker.setRotationAngle(satellite2Pos.hea / 2);
    if (selectedSatellite = 2) {
        compass.value = satellite2Pos.hea;
    }
})
var i2 = 0;
gpsListenerSat2.subscribe(function(message) {
    satellite2Pos.lat = message.latitude;
    satellite2Pos.lng = message.longitude;
    if (mapSetted) {
        if(i2 == 0)
        {
            satellite2Marker.addTo(map).bindPopup("Satellite 2");
            if (selectedSatellite == 2 || selectedSatellite == 0) {
                map.panTo([satellite2Pos.lat, satellite2Pos.lng]);
            }
        }
        if(i2 % cycleNumber == 0)
        {
            satellite2Marker.setLatLng([satellite2Pos.lat, satellite2Pos.lng]);
        }
        i2++;
    }
});

compassListenerSat3.subscribe(function(message){
    satellite3Pos.hea = message.true_heading;
    satellite3Marker.setRotationAngle(satellite3Pos.hea / 2);
    if (selectedSatellite = 3) {
        compass.value = satellite3Pos.hea;
    }
})
var i3 = 0;
gpsListenerSat3.subscribe(function(message) {
    satellite3Pos.lat = message.latitude;
    satellite3Pos.lng = message.longitude;
    if (mapSetted) {
        if(i3 == 0)
        {
            satellite3Marker.addTo(map).bindPopup("Satellite 3");
            if (selectedSatellite == 3 || selectedSatellite == 0) {
                map.panTo([satellite3Pos.lat, satellite3Pos.lng]);
            }
        }
        if(i3 % cycleNumber == 0)
        {
            satellite3Marker.setLatLng([satellite3Pos.lat, satellite3Pos.lng]);
        }
        i3++;
    }
});

compassListenerSat4.subscribe(function(message){
    satellite4Pos.hea = message.true_heading;
    satellite4Marker.setRotationAngle(satellite4Pos.hea / 2);
    if (selectedSatellite = 4) {
        compass.value = satellite4Pos.hea;
    }
})
var i4 = 0;
gpsListenerSat4.subscribe(function(message) {
    satellite4Pos.lat = message.latitude;
    satellite4Pos.lng = message.longitude;
    if (mapSetted) {
        if(i4 == 0)
        {
            satellite4Marker.addTo(map).bindPopup("Satellite 4");
            if (selectedSatellite == 4 || selectedSatellite == 0) {
                map.panTo([satellite4Pos.lat, satellite4Pos.lng]);
            }
        }
        if(i4 % cycleNumber == 0)
        {
            satellite4Marker.setLatLng([satellite4Pos.lat, satellite4Pos.lng]);
        }
        i4++;
    }
});
