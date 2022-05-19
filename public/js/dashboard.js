var mapSetted = false;
var centeredLocation = {lat: 48.711252, lng: 2.217757};
var selectedSatellite = 0; // 0 is for general
var cycleNumber = 10;
var centeredLocation;
var zoomLevel = 18;

var userPos = {lat: 0., lng: 0., hea: 0.};
var satellite1Pos = {lat: 0., lng: 0., hea: 0.};
var satellite2Pos = {lat: 0., lng: 0., hea: 0.};
var satellite3Pos = {lat: 0., lng: 0., hea: 0.};
var satellite4Pos = {lat: 0., lng: 0., hea: 0.};

var detectedStrategicPointListSat1 = [];
var detectedStrategicPointListSat3 = [];
var detectedStrategicPointListSat4 = [];

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

baseLayers = {
    "Satellite": satelliteLayer,
    "Plan": planLayer,
}
overlays = {
}

L.control.layers(baseLayers, overlays).addTo(map);
L.control.scale({imperial: false, metric: true}).addTo(map);
map.attributionControl.setPrefix(false);

map.setView(centeredLocation, zoomLevel);

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
    $('#satellite1Connection').addClass('visually-hidden')
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
    $('#satellite3Connection').addClass('visually-hidden')
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
    $('#satellite4Connection').addClass('visually-hidden')
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

var missionContextListenerSat1 = new ROSLIB.Topic({
    ros : ros1,
    name : 'mission/mission_context',
    messageType : 'navigation_msgs/MissionContext'
});

var missionContextListenerSat3 = new ROSLIB.Topic({
    ros : ros3,
    name : 'mission/mission_context',
    messageType : 'navigation_msgs/MissionContext'
});

var missionContextListenerSat4 = new ROSLIB.Topic({
    ros : ros4,
    name : 'mission/mission_context',
    messageType : 'navigation_msgs/MissionContext'
});

var i0 = 0;
gpsListenerUser.subscribe(function(message) {
    userPos.lat = message.latitude;
    userPos.lng = message.longitude;
    if (mapSetted) {
        if(i0 % cycleNumber == 0)
        {
            userMarker.addTo(map).bindPopup("Vous êtes ici");
            userMarker.setLatLng([userPos.lat, userPos.lng]);
        }
        i0++;
    }
    else
    {
        if (selectedSatellite == 0) {
            map.setView([userPos.lat, userPos.lng], zoomLevel);
            mapSetted = true;
        }
    }
});

compassListenerSat1.subscribe(function(message) {
    let qw = message.orientation.w;
    let qx = message.orientation.x;
    let qy = message.orientation.y;
    let qz = message.orientation.z;
    satellite1Pos.hea = -180.0*Math.atan2(2.0*(qw*qz+qx+qy), 1.0-2.0*(qy*qy+qz*qz))/Math.PI;
    satellite1Marker.setRotationAngle(satellite1Pos.hea/2.0);
    if (selectedSatellite == 1) {
        refreshCompass(satellite1Pos.hea);
    }
})
var i1 = 0;
gpsListenerSat1.subscribe(function(message) {
    satellite1Pos.lat = message.latitude;
    satellite1Pos.lng = message.longitude;
    if (mapSetted) {
        if(i1 % cycleNumber == 0)
        {
            satellite1Marker.addTo(map).bindPopup("Satellite 1");
            satellite1Marker.setLatLng([satellite1Pos.lat, satellite1Pos.lng]);
        }
        i1++;
    }
    else
    {
        if (selectedSatellite == 1) {
            map.setView([satellite1Pos.lat, satellite1Pos.lng], zoomLevel);
            mapSetted = true;
        }
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
        if(i3 % cycleNumber == 0)
        {
            satellite3Marker.addTo(map).bindPopup("Satellite 3");
            satellite3Marker.setLatLng([satellite3Pos.lat, satellite3Pos.lng]);
        }
        i3++;
    }
    else
    {
        if (selectedSatellite == 3) {
            map.setView([satellite3Pos.lat, satellite3Pos.lng], zoomLevel);
            mapSetted = true;
        }
    }
});

compassListenerSat4.subscribe(function(message) {
    let qw = message.orientation.w;
    let qx = message.orientation.x;
    let qy = message.orientation.y;
    let qz = message.orientation.z;
    satellite4Pos.hea = 180.0*Math.atan2(2.0*qw*qz+qx+qy, 1.0-2.0*(qy*qy+qz*qz))/Math.PI;
    satellite4Marker.setRotationAngle(satellite4Pos.hea/2.0);
    if (selectedSatellite == 4) {
        refreshCompass(satellite4Pos.hea);
    }
})
var i4 = 0;
gpsListenerSat4.subscribe(function(message) {
    satellite4Pos.lat = message.pose.position.latitude;
    satellite4Pos.lng = message.pose.position.longitude;
    if (mapSetted) {
        if(i4 % cycleNumber == 0)
        {
            satellite4Marker.addTo(map).bindPopup("Satellite 4");
            satellite4Marker.setLatLng([satellite4Pos.lat, satellite4Pos.lng]);
        }
        i4++;
    }
    else
    {
        if (selectedSatellite == 4) {
            map.setView([satellite4Pos.lat, satellite4Pos.lng], zoomLevel);
            mapSetted = true;
        }
    }
});

missionContextListenerSat1.subscribe(function(message) {
    detectedStrategicPointListSat1 = [];
    message.strategic_points.forEach(p => {
        detectedStrategicPointListSat1.push({
            "id": p.id,
            "latitude": p.position.latitude,
            "longitude": p.position.longitude,
            "type": p.type,
            "state": p.status,
            "radius": p.radius,
            "message": p.message
        });
    });
    updateDetectedStrategicPointList(detectedStrategicPointListSat1);
});

missionContextListenerSat3.subscribe(function(message) {
    detectedStrategicPointListSat3 = [];
    message.strategic_points.forEach(p => {
        detectedStrategicPointListSat3.push({
            "id": p.id,
            "latitude": p.position.latitude,
            "longitude": p.position.longitude,
            "type": p.type,
            "state": p.status,
            "radius": p.radius,
            "message": p.message
        });
    });
    updateDetectedStrategicPointList(detectedStrategicPointListSat3);
});

missionContextListenerSat4.subscribe(function(message) {
    detectedStrategicPointListSat4 = [];
    message.strategic_points.forEach(p => {
        detectedStrategicPointListSat4.push({
            "id": p.id,
            "latitude": p.position.latitude,
            "longitude": p.position.longitude,
            "type": p.type,
            "state": p.status,
            "radius": p.radius,
            "message": p.message
        });
    });
    updateDetectedStrategicPointList(detectedStrategicPointListSat4);
});

var updateDetectedStrategicPointList = function (strategicPoints) {
    strategicPoints.forEach(element => {
        if (element.marker) {
            element.marker.removeFrom(map);
            element.circle.removeFrom(map);
        }
    });

    let color = {0: "green", 1: "orange", 2: "red"};
    let type = {0: "unknown", 1: "hybrid", 2: "ground", 3: "aerial"};
    
    strategicPoints.forEach(p => {
        let trapIcon = L.icon({
            iconUrl: "../css/images/"+type[p.type]+"_trap_"+color[p.state]+".svg",
            iconSize:     [30, 30],
            iconAnchor:   [15, 15],
            popupAnchor:  [0, 0]
        });
        if (!p.marker) {
            var circle = new L.circle([p.latitude, p.longitude], {
                color: color[p.state],
                radius: p.radius,
            });
            var marker = new L.marker([p.latitude, p.longitude], {
                icon: trapIcon,
            });
            p.circle = circle;
            p.marker = marker;

            p.marker.on('click', function (event) {
                $('.listItem.active').removeClass("active");
                $('#'+p.id).addClass("active");
            });
        }
        p.marker.addTo(map).bindPopup(p.message);
        p.circle.addTo(map);
    });
    currStrategicPointID = strategicPoints.length + 1;

    $("#detectedStrategicPointListGroup").empty();
    strategicPoints.forEach(element => {
        let bootstrapColor = {0: 'success', 1: 'warning', 2: 'danger'};
        let color = {0: "green", 1: "orange", 2: "red"};
        let type = {0: "unknown", 1: "hybrid", 2: "ground", 3: "aerial"};
        let strategicPointText = {3: 'Menace aérienne', 1: 'Menace hybride', 2: 'Menace terrestre'};
        $("#detectedStrategicPointListGroup").append('<li class="list-group-item list-group-item-'+bootstrapColor[element.state]+' listItem p-2" id="'+element.id+'">\n<div class="d-flex">\n<img class="align-self-center" src="../css/images/'+type[element.type]+'_trap_'+color[element.state]+'.svg" height="22"></img>\n<p class="text flex-grow-1 my-0 align-self-center text-center" id="'+element.id+'-text">'+strategicPointText[element.type]+'</p></div></li>');
    });
}