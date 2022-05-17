mapSetted = false;
var selectedSatellite = 0; // 0 is for general
var cycleNumber = 5;
var centeredLocation;
var zoomLevel = 18;

var userPos = {lat: 0., lng: 0., hea: 0.};
var satellite1Pos = {lat: 0., lng: 0., hea: 0.};
var satellite2Pos = {lat: 0., lng: 0., hea: 0.};
var satellite3Pos = {lat: 0., lng: 0., hea: 0.};
var satellite4Pos = {lat: 0., lng: 0., hea: 0.};

// Leaflet.js

var satelliteLayer = L.tileLayer('https://wxs.ign.fr/{apikey}/geoportail/wmts?REQUEST=GetTile&SERVICE=WMTS&VERSION=1.0.0&STYLE={style}&TILEMATRIXSET=PM&FORMAT={format}&LAYER=ORTHOIMAGERY.ORTHOPHOTOS&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}', {
	attribution: '<a href="https://www.geoportail.gouv.fr/">Geoportail France</a>',
	bounds: [[-75, -180], [81, 180]],
	minZoom: 2,
	maxZoom: 19,
	apikey: 'choisirgeoportail',
	format: 'image/jpeg',
	style: 'normal'
});

var planLayer = L.tileLayer('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
	maxZoom: 20,
	attribution: '<a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
});

var map = L.map('mapdiv', {
    layers: [satelliteLayer]
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
    "Satellite": satelliteLayer,
    "Plan": planLayer,
}
overlays = {
}

L.control.layers(baseLayers, overlays).addTo(map);
L.control.scale({imperial: false, metric: true}).addTo(map);
map.attributionControl.setPrefix(false);

var userIcon = L.icon({
    iconUrl: "../css/images/home_blue.svg",
    iconSize:     [50, 50],
    iconAnchor:   [25, 25],
    popupAnchor:  [0, 0]
});

var userMarker = new L.marker([0, 0], {
    icon: userIcon,
});

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

var blackDotIcon = L.icon({
    iconUrl: "../css/images/black_dot.svg",
    iconSize:     [16, 16],
    iconAnchor:   [8, 8],
    popupAnchor:  [0, 0]
});

var blueDotIcon = L.icon({
    iconUrl: "../css/images/blue_dot.svg",
    iconSize:     [16, 16],
    iconAnchor:   [8, 8],
    popupAnchor:  [0, 0]
});

// ROS

var ros1 = new ROSLIB.Ros({url : 'ws://11.0.0.11:9090'})
var ros3 = new ROSLIB.Ros({url : 'ws://11.0.0.13:9090'})
var ros4 = new ROSLIB.Ros({url : 'ws://11.0.0.14:9090'})

ros1.on('connection', function() {
    $('#satellite1Connection').removeClass('visually-hidden')
});

ros1.on('error', function(error) {
    if (selectedSatellite == 1) {
        Swal.fire({
            icon: 'error',
            title: 'No connection',
            text: 'Unable to communicate with ROS master',
        })
    }
});

ros3.on('connection', function() {
    $('#satellite3Connection').removeClass('visually-hidden')
});

ros3.on('error', function(error) {
    if (selectedSatellite == 3) {
        Swal.fire({
            icon: 'error',
            title: 'No connection',
            text: 'Unable to communicate with ROS master',
        })
    }
});

ros4.on('connection', function() {
    $('#satellite4Connection').removeClass('visually-hidden')
});

ros4.on('error', function(error) {
    if (selectedSatellite == 4) {
        Swal.fire({
            icon: 'error',
            title: 'No connection',
            text: 'Unable to communicate with ROS master',
        })
    }
});

var gpsListenerUser = new ROSLIB.Topic({
    ros : ros1,
    name : '/control_station/fix',
    messageType : 'sensor_msgs/NavSatFix'
});

var compassListenerSat1 = new ROSLIB.Topic({
    ros : ros1,
    name : '/imu/data',
    messageType : 'sensor_msgs/Imu'
});

var gpsListenerSat1 = new ROSLIB.Topic({
    ros : ros1,
    name : '/gps/filtered',
    messageType : 'sensor_msgs/NavSatFix'
});

var compassListenerSat3 = new ROSLIB.Topic({
    ros : ros3,
    name : '/anafi/imu',
    messageType : 'sensor_msgs/Imu'
});

var gpsListenerSat3 = new ROSLIB.Topic({
    ros : ros3,
    name : '/anafi/gps',
    messageType : 'geographic_msgs/GeoPoseStamped'
});

var compassListenerSat4 = new ROSLIB.Topic({
    ros : ros4,
    name : '/anafi/imu',
    messageType : 'sensor_msgs/Imu'
});
var gpsListenerSat4 = new ROSLIB.Topic({
    ros : ros4,
    name : '/anafi/gps',
    messageType : 'geographic_msgs/GeoPoseStamped'
});

var i0 = 0;
gpsListenerUser.subscribe(function(message) {
    userPos.lat = message.latitude;
    userPos.lng = message.longitude;
    if (mapSetted) {
        if(i0 == 0)
        {
            userMarker.addTo(map).bindPopup("Vous êtes ici");
            if (selectedSatellite == 0) {
                map.panTo([userPos.lat, userPos.lng]);
            }
        }
        if(i0 % cycleNumber == 0)
        {
            userMarker.setLatLng([userPos.lat, userPos.lng]);
        }
        i0++;
    }
});

compassListenerSat1.subscribe(function(message) {
    let qw = message.orientation.w;
    let qx = message.orientation.x;
    let qy = message.orientation.y;
    let qz = message.orientation.z;
    satellite1Pos.hea = 90.0-180.0*Math.atan2(2.0*(qw*qz+qx+qy), 1.0-2.0*(qy*qy+qz*qz))/Math.PI;
    satellite1Marker.setRotationAngle(satellite1Pos.hea/2.0);
    if (selectedSatellite == 1) {
        console.log(satellite1Pos.hea);
        refreshCompass(satellite1Pos.hea);
    }
})
var i1 = 0;
gpsListenerSat1.subscribe(function(message) {
    satellite1Pos.lat = message.latitude;
    satellite1Pos.lng = message.longitude;
    if (mapSetted) {
        if(i1 == 0)
        {
            satellite1Marker.addTo(map).bindPopup("Satellite 1");
            if (selectedSatellite == 1) {
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

compassListenerSat3.subscribe(function(message) {
    let qw = message.orientation.w;
    let qx = message.orientation.x;
    let qy = message.orientation.y;
    let qz = message.orientation.z;
    satellite3Pos.hea = 180.0*Math.atan2(2.0*qw*qz+qx+qy, 1.0-2.0*(qy*qy+qz*qz))/Math.PI;
    satellite3Marker.setRotationAngle(satellite3Pos.hea/2.0);
    if (selectedSatellite == 3) {
        refreshCompass(satellite3Pos.hea);
    }
})

var i3 = 0;
gpsListenerSat3.subscribe(function(message) {
    satellite3Pos.lat = message.pose.position.latitude;
    satellite3Pos.lng = message.pose.position.longitude;
    if (mapSetted) {
        if(i3 == 0)
        {
            satellite3Marker.addTo(map).bindPopup("Satellite 3");
            if (selectedSatellite == 3) {
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

compassListenerSat4.subscribe(function(message) {
    satellite4Pos.hea = message.true_heading;
    satellite4Marker.setRotationAngle(satellite4Pos.hea / 2);
    if (selectedSatellite == 4) {
        refreshCompass(satellite4Pos.hea);
    }
})
var i4 = 0;
gpsListenerSat4.subscribe(function(message) {
    satellite4Pos.lat = message.pose.position.latitude;
    satellite4Pos.lng = message.pose.position.longitude;
    if (mapSetted) {
        if(i4 == 0)
        {
            satellite4Marker.addTo(map).bindPopup("Satellite 4");
            if (selectedSatellite == 4) {
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