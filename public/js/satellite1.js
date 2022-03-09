$("#navSatellite1").addClass("active");
selectedSatellite = 1;

// Variable
var waypointList = [];
var mode;
var addingWaypoint = false;
var currID = 0;

/// Socket.io | Recover mission

socket.emit("getMode");

socket.on("currentMode", function(currentMode) {
    mode = currentMode;
    $('#'+mode+'ModeBtn:input').prop("checked", true);
    $('#'+mode+'ModeLabel').addClass('active');
    $('#'+mode+'ModeCollapse').collapse('show');
});

socket.emit("getWaypointList");

socket.on("currentWaypointList", function(currentWaypointList) {
    currID = currentWaypointList.length;
    updateWaypointList(currentWaypointList);
    updatePath();
});

// Mode selection Navigation | Exploration | Tasks

$('#navigationModeBtn:input').change(function () {
    $('#'+mode+'ModeLabel').removeClass('active');
    $('#'+mode+'ModeCollapse').collapse('hide');
    mode = 'navigation';
    sendMode(mode);
    $('#'+mode+'ModeLabel').addClass('active');
    $('#'+mode+'ModeCollapse').collapse('show');
})

$('#explorationModeBtn:input').change(function () {
    $('#'+mode+'ModeLabel').removeClass('active');
    $('#'+mode+'ModeCollapse').collapse('hide');
    mode = 'exploration';
    sendMode(mode);
    $('#'+mode+'ModeLabel').addClass('active');
    $('#'+mode+'ModeCollapse').collapse('show');
})

$('#tasksModeBtn:input').change(function () {
    $('#'+mode+'ModeLabel').removeClass('active');
    $('#'+mode+'ModeCollapse').collapse('hide');
    mode = 'tasks';
    sendMode(mode);
    $('#'+mode+'ModeLabel').addClass('active');
    $('#'+mode+'ModeCollapse').collapse('show');
})

$('#telemetryModeBtn:input').change(function () {
    $('#'+mode+'ModeLabel').removeClass('active');
    $('#'+mode+'ModeCollapse').collapse('hide');
    mode = 'telemetry';
    sendMode(mode);
    $('#'+mode+'ModeLabel').addClass('active');
    $('#'+mode+'ModeCollapse').collapse('show');
})

// Navigation

$(".addingWaypointBtn").click(function (event) {
    $('#addingWaypointCollapse').collapse('hide');
    $('#addingWaypointCancelCollapse').collapse('show');
    addingWaypoint = true;
});

$('#addWaypointCancel').click(function (event) {
    addingWaypoint = false;
    $('#addingWaypointCancelCollapse').collapse('hide');
    $('#addingWaypointCollapse').collapse('show');
});

$('#clearWaypointList').click(function (event) {
    if (!$('#clearWaypointList').hasClass('disabled')){
        waypointList.forEach(element => {
            map.removeLayer(element.marker);
        });
        currID = 0;
        waypointList = [];
        updateWaypointList(waypointList);
        updatePath();
    }
});

$('#refreshMission').click(function (event) {
    socket.emit("getWaypointList");
});

map.on('click', function (e) {
    $('.waypointItem.active').removeClass("active");
    if (addingWaypoint) {
        var id = "id" + currID;
        var latlong = e.latlng;

        waypointList.push({
            "latlong": [latlong.lat, latlong.lng],
            "id": id
        });

        updateWaypointList(waypointList);
        updatePath();

        currID++;
        $(".removeWaypointBtn").click(function (event) {
            $(this).closest("li").remove();
        });
    }
});

// Swap
var el = document.getElementById('waypointListGroup');

var swapArrayElements = function (arr, indexA, indexB) {
    var temp = arr[indexA];
    arr[indexA] = arr[indexB];
    arr[indexB] = temp;
};

var sortable = Sortable.create(el, {
    onEnd: function (evt) {
        var itemEl = evt.item;  // dragged HTMLElement
        console.log(itemEl.id, evt.oldIndex, evt.newIndex);
        swapArrayElements(waypointList, evt.oldIndex, evt.newIndex);
        updateWaypointList(waypointList);
        updatePath();
    },
    handle: '.handle',
    animation: 150,
});

// Send mission
$("#submitWaypointList").click(function (event) {
    if (!$('#submitWaypointList').hasClass('disabled')){
        let wp = [];
        let id = 0;
        waypointList.forEach(element => {
            wp.push({
                "latlong": element.latlong,
                "id": "id" + id
            });
            id++;
        })
        sendWaypoint(wp);
        publishWaypoint(wp);
    }
});

var updatePath = function () {
    var latlongs = [];
    waypointList.forEach(element => {
        latlongs.push(element.latlong);
    });
    polyline.setLatLngs(latlongs);
    decorator.setPaths(polyline);
}

var removeWaypoint = function (event) {
    var id = $(this).closest("li").attr("id");
    var i = 0;
    var k = 0;
    waypointList.forEach(element => {
        if (id == element.id) {
            map.removeLayer(element.marker);
            k = i;
        }
        i++;
    });
    waypointList.splice(k, 1);
    $(this).closest("li").remove();
    updatePath();
    if (waypointList.length == 0){
        $("#clearWaypointList").addClass("disabled");
        $("#submitWaypointList").addClass("disabled");
    }
};

var posShow = function (position) {
    return (Math.trunc(10000 * position.lat) / 10000 + ', ' + Math.trunc(10000 * position.lng) / 10000)
}

var updateWaypointList = function (waypoints) {
    // wps must contain an id and a latlong array at the bare minimum
    waypointList.forEach(element => {
        if (element.marker) {
            map.removeLayer(element.marker);
        }
    });
    waypointList = [];
    if (waypoints.length == 0) {
        $("#clearWaypointList").addClass("disabled");
        $("#submitWaypointList").addClass("disabled");
    } else {
        $("#clearWaypointList").removeClass("disabled");
        $("#submitWaypointList").removeClass("disabled");

        waypoints.forEach(w => {
            if (!w.marker) {
                var marker = new L.marker(w.latlong, {
                    draggable: 'true'
                });
                marker.on('dragend', function (event) {
                    var position = marker.getLatLng();
                    marker.setLatLng(position, {
                        draggable: 'true'
                    }).update();
                    w.latlong = [position.lat, position.lng];

                    document.getElementById(w.id+'-text').childNodes[0].nodeValue = posShow(position);

                    updatePath();
                });
                w.marker = marker;

                marker.on('click', function (event) {
                    $('.waypointItem.active').removeClass("active");
                    $('#' + w.id).addClass("active");
                });
            }
            map.addLayer(w.marker);
            waypointList.push(w);
        });
    }
    currID = waypoints.length + 1;

    $("#waypointListGroup").empty();
    waypointList.forEach(element => {
        var position = element.marker.getLatLng();
        $("#waypointListGroup").append('<li class="list-group-item waypointItem" id="'+element.id+'">\n<div class="d-flex">\n<p class="text flex-grow-1 my-0 align-text-center" id="'+element.id+'-text">'+posShow(position)+'</p>\n<button class="btn handle mr-2 align-content-center swapWaypointBtn" type="button"><img src="../css/images/grabber.svg"></img></button>\n<button class="btn removeWaypointBtn" type="button"><img src="../css/images/x.svg"></img></button></div></li>');
    });

    $(".removeWaypointBtn").click(removeWaypoint);
}

/// Initialize

updateWaypointList(waypointList);

var polyline = L.polyline([], {weight: 8, opacity: 1, color: '#fc0'}).addTo(map);

var decorator = L.polylineDecorator(polyline, {
    patterns: [
        // defines a pattern of 10px-wide dashes, repeated every 100px on the line
        {offset: 25, repeat: 50, symbol: L.Symbol.arrowHead({pixelSize: 8, pathOptions: {fillOpacity: 0.3, weight: 0, color: '#222'}})}
    ]
}).addTo(map);

updatePath();

// ROS

var velocityListener = new ROSLIB.Topic({
    ros : ros,
    name : '/husky_velocity_controller/odom',
    messageType : 'nav_msgs/Odometry'
});

velocityListener.subscribe(function(message) {
    let velocity_kmh = 3.6 * message.twist.twist.linear.x;
    velocity.value = Math.abs(velocity_kmh.toFixed(2));
});

var videoStreamListener = new ROSLIB.Topic({
    ros: ros,
    name: '/realsense/color/image_raw/compressed',
    messageType: 'sensor_msgs/CompressedImage'
});

videoStreamListener.subscribe(function(message) {
    document.getElementById('videoStreamImg').src = "data:image/jpg;base64," + message.data;
});

var batteryListener = new ROSLIB.Topic({
    ros: ros,
    name: '/charge_estimate',
    messageType: 'std_msgs/Float64'
});

batteryListener.subscribe(function(message) {
    $('#battery').css('width', message.data+'%').attr('aria-valuenow', message.data);
});

let waypointPub = new ROSLIB.Topic({
    ros : ros,
    name : '/mission/mission_plan',
    messageType : 'cohoma_msgs/MissionPlan'
});

var publishWaypoint = function(waypoints) {
    let currentTime = new Date();
    let wayPointList = [];
    let secs = Math.floor(currentTime.getTime()/1000);
    let nsecs = Math.round(1000000000*(currentTime.getTime()/1000-secs));
    waypoints.forEach(w => {
        let wayPoint = new ROSLIB.Message({
            position : {
                latitude : w.latlong[0],
                longitude : w.latlong[1],
                altitude : 0.0
            },
            trap_clearance : false,
            reached : false
        });
        wayPointList.push(wayPoint);
    })
    let missionPlan = new ROSLIB.Message({
        header : {
            stamp : {
                secs : secs,
                nsecs : nsecs
            }
        },
        mission_id : "cohoma_hmi-" + secs + "." + nsecs,
        current_seq : 0,
        waypoints : wayPointList,
    });
    waypointPub.publish(missionPlan);
};