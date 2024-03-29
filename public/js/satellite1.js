$("#navSatellite1").addClass("active");
selectedSatellite = 1;

// Variable
var mode;
var waypointList = [];
var addingWaypoint = false;
var currID = 0;
var currCoverageAreaPointID = 0;
var currStrategicPointID = 0;
var cameraDisplay = false;
var missionLaunched = false;
var eStopOn = false;
var addingCoverageArea = false;
var coverageAreaList = [];
var addingStrategicPoint = false;
var strategicPointList = [];
var strategicPointType = 'hybrid';
var strategicPointState = 1;
var butterworthFilterCoeffs = new Fili.FirCoeffs().lowpass({
    order: 3,
    characteristic: 'butterworth',
    Fs: 50,
    Fc: 1,
});
var butterworthFilter = new Fili.FirFilter(butterworthFilterCoeffs);

var telemetryListenerList = [];

/// Socket.io | Recover mission

socket.emit("getMode");

socket.on("currentMode", function(currentMode) {
    mode = currentMode;
    $('#'+mode+'ModeBtn:input').prop("checked", true);
    $('#'+mode+'ModeLabel').addClass('active');
    $('#'+mode+'ModeCollapse').addClass("show");
});

socket.emit("getWaypointList");

socket.on("currentWaypointList", function(currentWaypointList) {
    currID = currentWaypointList.length;
    updateWaypointList(currentWaypointList);
    updatePath();
});

/// ROS

var velocityListener = new ROSLIB.Topic({
    ros : ros1,
    name : '/odometry/filtered_map',
    messageType : 'nav_msgs/Odometry'
});

velocityListener.subscribe(function(message) {
    let velocity_kmh = 3.6 * message.twist.twist.linear.x;
    velocity.value = Math.abs(velocity_kmh.toFixed(2));
});
telemetryListenerList.push(velocityListener);

var videoStreamListener = new ROSLIB.Topic({
    ros: ros1,
    name: '/zed_node/rgb/image_rect_color/compressed',
    messageType: 'sensor_msgs/CompressedImage'
});

$('#displayCameraBtn:input').change(function () {
    if (cameraDisplay)
    {
        $('#displayCameraLabel').removeClass('active');
        $('#displayCameraCollapse').removeClass("show");
        videoStreamListener.unsubscribe();
        telemetryListenerList.pop(telemetryListenerList.indexOf(videoStreamListener));
        cameraDisplay = false;
    }
    else
    {
        $('#displayCameraLabel').addClass('active');
        $('#displayCameraCollapse').addClass("show");
        videoStreamListener.subscribe(function(message) {
            document.getElementById('videoStreamImg').src = "data:image/jpg;base64," + message.data;
        });
        telemetryListenerList.push(videoStreamListener);
        cameraDisplay = true;
    }
})

var eStopPublisher = new ROSLIB.Topic({
    ros : ros1,
    name : '/e_stop',
    messageType : 'std_msgs/Bool'
});

$("#emergencyStop").click(function (event) {
    if (eStopOn)
    {
        let eStopMsg = new ROSLIB.Message({
            data : false
        });
        eStopPublisher.publish(eStopMsg);
        eStopOn = false;
        $('#emergencyStop').removeClass('active');
    }
    else
    {
        let eStopMsg = new ROSLIB.Message({
            data : true
        });
        eStopPublisher.publish(eStopMsg);
        eStopOn = true;
        $('#emergencyStop').addClass('active');
    }
});


var huskyStatusListener = new ROSLIB.Topic({
    ros: ros1,
    name: '/status',
    messageType: 'husky_msgs/HuskyStatus'
});

huskyStatusListener.subscribe(function(message) {
    $('#battery').css('width', butterworthFilter.singleStep(message.charge_estimate)*100+'%').attr('aria-valuenow', butterworthFilter.singleStep(message.charge_estimate)*100);
});
telemetryListenerList.push(huskyStatusListener);

var waypointPub = new ROSLIB.Topic({
    ros : ros1,
    name : '/mission/mission_plan',
    messageType : 'navigation_msgs/MissionPlan'
});


var submitMissionClient = new ROSLIB.Service({
    ros : ros1,
    name : '/mission/push_mission',
    serviceType : 'navigation_msgs/PushMission'
});

var launchMissionClient = new ROSLIB.Service({
    ros : ros1,
    name : '/mission/launch_mission',
    serviceType : 'std_srvs/Trigger'
});

var abortMissionClient = new ROSLIB.Service({
    ros : ros1,
    name : '/mission/abort_mission',
    serviceType : 'std_srvs/Empty'
});

/// Mode selection Navigation | Exploration | Tasks

$('#navigationModeBtn:input').change(function () {
    $('#'+mode+'ModeLabel').removeClass('active');
    $('#'+mode+'ModeCollapse').removeClass("show");
    mode = 'navigation';
    $('#'+mode+'ModeLabel').addClass('active');
    $('#'+mode+'ModeCollapse').addClass("show");
    unsubscribeTelemetryListener();
    sendMode(mode);
})

$('#explorationModeBtn:input').change(function () {
    $('#'+mode+'ModeLabel').removeClass('active');
    $('#'+mode+'ModeCollapse').removeClass("show");
    mode = 'exploration';
    $('#'+mode+'ModeLabel').addClass('active');
    $('#'+mode+'ModeCollapse').addClass("show");
    unsubscribeTelemetryListener();
    sendMode(mode);
})

$('#tasksModeBtn:input').change(function () {
    $('#'+mode+'ModeLabel').removeClass('active');
    $('#'+mode+'ModeCollapse').removeClass("show");
    mode = 'tasks';
    $('#'+mode+'ModeLabel').addClass('active');
    $('#'+mode+'ModeCollapse').addClass("show");
    unsubscribeTelemetryListener();
    sendMode(mode);
})

$('#telemetryModeBtn:input').change(function () {
    $('#'+mode+'ModeLabel').removeClass('active');
    $('#'+mode+'ModeCollapse').removeClass("show");
    mode = 'telemetry';
    $('#'+mode+'ModeLabel').addClass('active');
    $('#'+mode+'ModeCollapse').addClass("show");
    sendMode(mode);
})

// Navigation

$("#addingWaypointBtn").click(function (event) {
    $('#addingWaypointCollapse').removeClass("show");
    $('#addingWaypointCancelCollapse').addClass("show");
    addingWaypoint = true;
    $('.swapWaypointBtn.invisible').removeClass('invisible');
    $('.removeWaypointBtn.invisible').removeClass('invisible');
});

$('#addWaypointCancel').click(function (event) {
    $('#addingWaypointCancelCollapse').removeClass("show");
    $('#addingWaypointCollapse').addClass("show");
    addingWaypoint = false;
    $('.swapWaypointBtn').addClass('invisible');
    $('.removeWaypointBtn').addClass('invisible');
});

$('#clearWaypointList').click(function (event) {
    if (!$('#clearWaypointList').hasClass('disabled')){
        waypointList.forEach(element => {
            element.marker.removeFrom(map);
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

/// Swap

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

/// Send mission

$("#submitWaypointList").click(function (event) {
    let currentTime = new Date();
    let cohomaWaypoints = [];
    let secs = Math.floor(currentTime.getTime()/1000);
    let nsecs = Math.round(1000000000*(currentTime.getTime()/1000-secs));

    waypointList.forEach(w => {
        let wayPoint = new ROSLIB.Message({
            position : {
                latitude : w.latitude,
                longitude : w.longitude,
                altitude : 0.0
            },
            trap_clearance : false,
            reached : false
        });
        cohomaWaypoints.push(wayPoint);
    });
    let request = new ROSLIB.ServiceRequest({
        mission_id : "cohoma_hmi-" + secs + "." + nsecs,
        current_seq : 0,
        waypoints : cohomaWaypoints,
    });

    if (missionLaunched) {
        let request = new ROSLIB.ServiceRequest();
        abortMissionClient.callService(request, function(result) {
            missionLaunched = false;
            $('#launchMissionBtn').removeClass('disabled');
            $('#abortMissionBtn').addClass('disabled');
        });
    };

    submitMissionClient.callService(request, function(result) {
        if (result.success){
            missionLaunched = false;
            $('#launchMissionBtn').removeClass('disabled');
            $('#abortMissionBtn').addClass('disabled');
            $('#submitMissionCollapse').removeClass("show");
            $('#launchMissionCollapse').addClass("show");
        };
    });
});

$("#launchMissionBtn").click(function (event) {
    if (!missionLaunched){
        let request = new ROSLIB.ServiceRequest();
        launchMissionClient.callService(request, function(result) {
            if (result.success){
                missionLaunched = true;
                $('#launchMissionBtn').addClass('disabled');
                $('#abortMissionBtn').removeClass('disabled');
            }
        });
    };
});

$("#abortMissionBtn").click(function (event) {
    if (missionLaunched){
        let request = new ROSLIB.ServiceRequest();
        abortMissionClient.callService(request, function(result) {
            missionLaunched = false;
            $('#launchMissionBtn').removeClass('disabled');
            $('#abortMissionBtn').addClass('disabled');
        });
    };
});

var removeWaypoint = function (event) {
    var id = $(this).closest("li").attr("id");
    var i = 0;
    var k = 0;
    waypointList.forEach(element => {
        if (id == element.id) {
            element.marker.removeFrom(map);
            k = i;
        }
        i++;
    });
    waypointList.splice(k, 1);
    $(this).closest("li").remove();
    updateWaypointList(waypointList);
    updatePath();
    if (waypointList.length == 0){
        $("#clearWaypointList").addClass("disabled");
        $("#submitWaypointList").addClass("disabled");
    }
};

var updatePath = function () {
    var latlongs = [];
    waypointList.forEach(element => {
        latlongs.push([element.latitude, element.longitude]);
    });
    polyline.setLatLngs(latlongs);
    decorator.setPaths(polyline);
}

var posShow = function (position) {
    return (Math.trunc(10000 * position.lat) / 10000 + ', ' + Math.trunc(10000 * position.lng) / 10000)
}

var updateWaypointList = function (waypoints) {
    waypointList.forEach(element => {
        if (element.marker) {
            element.marker.removeFrom(map);
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
                var marker = new L.marker([w.latitude, w.longitude], {
                    icon: blackDotIcon,
                    draggable: 'true'
                });
                marker.on('dragend', function (event) {
                    var position = marker.getLatLng();
                    marker.setLatLng(position, {
                        draggable: 'true'
                    }).update();
                    w.latitude = position.lat;
                    w.longitude = position.lng;

                    document.getElementById(w.id+'-text').childNodes[0].nodeValue = posShow(position);
                    updatePath();
                });
                w.marker = marker;

                w.marker.on('click', function (event) {
                    $('.listItem.active').removeClass("active");
                    $('#'+w.id).addClass("active");
                });
            }
            w.marker.addTo(map);
            waypointList.push(w);
        });
    }
    currID = waypoints.length + 1;

    $("#waypointListGroup").empty();
    waypointList.forEach(element => {
        var position = element.marker.getLatLng();
        $("#waypointListGroup").append('<li class="list-group-item listItem p-2" id="'+element.id+'">\n<div class="d-flex">\n<img class="align-self-center" src="../css/images/black_dot.svg" height="22"></img>\n<p class="text flex-grow-1 my-0 text-center align-self-center" id="'+element.id+'-text">'+posShow(position)+'</p>\n<button class="btn handle mr-2 align-content-center swapWaypointBtn invisible" type="button"><img src="../css/images/grabber.svg"></img></button>\n<button class="btn removeWaypointBtn invisible" type="button"><img src="../css/images/x.svg"></img></button></div></li>');
    });
    if (addingWaypoint){
        $(".swapWaypointBtn.invisible").removeClass("invisible");
        $(".removeWaypointBtn.invisible").removeClass("invisible");
    }

    $(".removeWaypointBtn").click(removeWaypoint);

    $('#submitMissionCollapse').addClass("show");
    $('#launchMissionCollapse').removeClass("show");
    $('#launchMissionBtn').addClass('disabled');
}

/// Exploration

$("#submitCoverageArea").click(function (event) {

    let currentTime = new Date();
    let cohomaCoverageArea = [];
    let secs = Math.floor(currentTime.getTime()/1000);
    let nsecs = Math.round(1000000000*(currentTime.getTime()/1000-secs));

    coverageAreaList.forEach(p => {
        cohomaCoverageArea.push(new ROSLIB.Message({
                latitude : p.latitude,
                longitude : p.longitude,
                altitude : 0.0
            })
        );
    });
    
    let request = new ROSLIB.ServiceRequest({
        area : cohomaCoverageArea,
    });

    submitCoverageArea.callService(request, function(result) {
        if (result.success){
            coverageAreaList = [];
            result.waypoints.forEach(w => {
                coverageAreaList.push({
                    "latitude": w.latitude,
                    "longitude": w.longitude,
                    "id": w.id
                });
            });
            updateWaypointList(coverageAreaList);
            updatePath();
        };
    });
});

$("#addingCoverageAreaBtn").click(function (event) {
    $('#addingCoverageAreaCollapse').removeClass("show");
    $('#addingCoverageAreaCancelCollapse').addClass("show");
    addingCoverageArea = true;
    $('.removeCoverageAreaBtn').removeClass('invisible');
});

$('#addCoverageAreaCancel').click(function (event) {
    $('#addingCoverageAreaCancelCollapse').removeClass("show");
    $('#addingCoverageAreaCollapse').addClass("show");
    addingCoverageArea = false;
    $('.removeCoverageAreaBtn').addClass('invisible');
});

$('#clearCoverageAreaList').click(function (event) {
    if (!$('#clearCoverageAreaList').hasClass('disabled')){
        coverageAreaList.forEach(element => {
            element.marker.removeFrom(map);
        });
        currCoverageAreaPointID = 0;
        coverageAreaList = [];
        updateCoverageAreaList(coverageAreaList);
        updatePolygon();
    }
});

var updatePolygon = function () {
    var latlongs = [];
    coverageAreaList.forEach(element => {
        latlongs.push([element.latitude, element.longitude]);
    });
    polygon.setLatLngs(latlongs);
}

var updateCoverageAreaList = function (coverageAreaPoints) {
    coverageAreaPoints.forEach(element => {
        if (element.marker) {
            element.marker.removeFrom(map);
        }
    });
    coverageAreaList = [];
    if (coverageAreaPoints.length == 0) {
        $("#clearCoverageAreaList").addClass("disabled");
        $("#submitCoverageArea").addClass("disabled");
    } else {
        $("#clearCoverageAreaList").removeClass("disabled");
        $("#submitCoverageArea").removeClass("disabled");

        coverageAreaPoints.forEach(p => {
            if (!p.marker) {
                var marker = new L.marker([p.latitude, p.longitude], {
                    icon: blueDotIcon,
                    draggable: 'true'
                });
                marker.on('dragend', function (event) {
                    var position = marker.getLatLng();
                    marker.setLatLng(position, {
                        draggable: 'true'
                    }).update();
                    p.latitude = position.lat;
                    p.longitude = position.lng;

                    document.getElementById(p.id+'-text').childNodes[0].nodeValue = posShow(position);
                    updatePolygon();
                });
                p.marker = marker;

                p.marker.on('click', function (event) {
                    $('.listItem.active').removeClass("active");
                    $('#'+p.id).addClass("active");
                });
            }
            p.marker.addTo(map);
            coverageAreaList.push(p);
        });
    }
    currCoverageAreaPointID = coverageAreaPoints.length + 1;

    $("#coverageAreaListGroup").empty();
    coverageAreaList.forEach(element => {
        var position = element.marker.getLatLng();
        $("#coverageAreaListGroup").append('<li class="list-group-item listItem p-2" id="'+element.id+'">\n<div class="d-flex">\n<img class="align-self-center" src="../css/images/blue_dot.svg" height="22"></img>\n<p class="text flex-grow-1 my-0 align-self-center text-center" id="'+element.id+'-text">'+posShow(position)+'</p>\n<button class="btn invisible removeCoverageAreaBtn" type="button"><img src="../css/images/x.svg"></img></button></div></li>');
    });
    if (addingCoverageArea){
        $(".removeCoverageAreaBtn.invisible").removeClass("invisible");
    }

    $(".removeCoverageAreaBtn").click(removeCoverageArea);
}

var removeCoverageArea = function (event) {
    var id = $(this).closest("li").attr("id");
    var i = 0;
    var k = 0;
    coverageAreaList.forEach(element => {
        if (id == element.id) {
            element.marker.removeFrom(map);
            k = i;
        }
        i++;
    });
    coverageAreaList.splice(k, 1);
    $(this).closest("li").remove();
    updateCoverageAreaList(coverageAreaList);
    updatePolygon();
    if (coverageAreaList.length == 0){
        $("#clearCoverageAreaList").addClass("disabled");
        $("#submitCoverageAreaList").addClass("disabled");
    }
};

/// Tasks

$("#submitStrategicPointList").click(function (event) {

    let currentTime = new Date();
    let cohomaStrategicPoint = [];
    let secs = Math.floor(currentTime.getTime()/1000);
    let nsecs = Math.round(1000000000*(currentTime.getTime()/1000-secs));

    strategicPointList.forEach(p => {
        cohomaStrategicPoint.push(new ROSLIB.Message({
            latitude : p.latitude,
            longitude : p.longitude,
            altitude : 0.0
            })
        );
    });
    
    let request = new ROSLIB.ServiceRequest({
        area : cohomaStrategicPoint,
    });

    submitStrategicPoint.callService(request, function(result) {
        if (result.success){
            strategicPointList = [];
            currStrategicPointID = 0;
            result.waypoints.forEach(w => {
                strategicPointList.push(w);
                currStrategicPointID++;
            });
            updateWaypointList(strategicPointList);
        };
    });
});

$("#addingStrategicPointBtn").click(function (event) {
    $('#addingStrategicPointCollapse').removeClass("show");
    $('#addingStrategicPointCancelCollapse').addClass("show");
    addingStrategicPoint = true;
    $('.removeStrategicPointBtn').removeClass('invisible');
});

$('#addStrategicPointCancel').click(function (event) {
    $('#addingStrategicPointCancelCollapse').removeClass("show");
    $('#addingStrategicPointCollapse').addClass("show");
    addingStrategicPoint = false;
    $('.removeStrategicPointBtn').addClass('invisible');
});

$('#clearStrategicPointList').click(function (event) {
    if (!$('#clearStrategicPointList').hasClass('disabled')){
        strategicPointList.forEach(element => {
            element.marker.removeFrom(map);
        });
        currStrategicPointPointID = 0;
        strategicPointList = [];
        updateStrategicPointList(strategicPointList);
    }
});

var updateStrategicPointList = function (strategicPoints) {
    strategicPoints.forEach(element => {
        if (element.marker) {
            element.marker.removeFrom(map);
            element.circle.removeFrom(map);
        }
    });
    strategicPointList = [];
    if (strategicPoints.length == 0) {
        $("#clearStrategicPointList").addClass("disabled");
        $("#submitStrategicPointList").addClass("disabled");
    } else {
        $("#clearStrategicPoint").removeClass("disabled");
        $("#submitStrategicPointList").removeClass("disabled");

        let color = {0: "green", 1: "orange", 2: "red"};
        var trapIcon = L.icon({
            iconUrl: "../css/images/"+strategicPointType+"_trap_"+color[strategicPointState]+".svg",
            iconSize:     [30, 30],
            iconAnchor:   [15, 15],
            popupAnchor:  [0, 0]
        });
        
        strategicPoints.forEach(p => {
            if (!p.marker) {
                var circle = new L.circle([p.latitude, p.longitude], {
                    color: color[p.state],
                    radius: p.radius
                });
                var marker = new L.marker([p.latitude, p.longitude], {
                    icon: trapIcon,
                    draggable: 'true'
                });
                marker.on('dragend', function (event) {
                    var position = marker.getLatLng();
                    marker.setLatLng(position, {
                        draggable: 'true'
                    }).update();
                    circle.setLatLng(position);
                    p.latitude = position.lat;
                    p.longitude = position.lng;
                });
                p.circle = circle;
                p.marker = marker;

                p.marker.on('click', function (event) {
                    $('.listItem.active').removeClass("active");
                    $('#'+p.id).addClass("active");
                });
            }
            p.marker.addTo(map);
            p.circle.addTo(map);
            strategicPointList.push(p);
        });
    }
    currStrategicPointID = strategicPoints.length + 1;

    $("#strategicPointListGroup").empty();
    strategicPointList.forEach(element => {
        let bootstrapColor = {0: 'success', 1: 'warning', 2: 'danger'};
        let color = {0: "green", 1: "orange", 2: "red"};
        let strategicPointText = {'aerial': 'Menace aérienne', 'hybrid': 'Menace hybride', 'ground': 'Menace terrestre'};
        $("#strategicPointListGroup").append('<li class="list-group-item list-group-item-'+bootstrapColor[element.state]+' listItem p-2" id="'+element.id+'">\n<div class="d-flex">\n<img class="align-self-center" src="../css/images/'+element.type+'_trap_'+color[element.state]+'.svg" height="22"></img>\n<p class="text flex-grow-1 my-0 align-self-center text-center" id="'+element.id+'-text">'+strategicPointText[element.type]+'</p>\n<button class="btn invisible removeStrategicPointBtn" type="button"><img src="../css/images/x.svg"></img></button></div></li>');
    });
    if (addingStrategicPoint){
        $(".removeStrategicPointBtn.invisible").removeClass("invisible");
    }

    $(".removeStrategicPointBtn").click(removeStrategicPoint);
}

var removeStrategicPoint = function (event) {
    var id = $(this).closest("li").attr("id");
    var i = 0;
    var k = 0;
    strategicPointList.forEach(element => {
        if (id == element.id) {
            element.marker.removeFrom(map);
            element.circle.removeFrom(map);
            k = i;
        }
        i++;
    });
    strategicPointList.splice(k, 1);
    $(this).closest("li").remove();
    updateStrategicPointList(strategicPointList);
    if (strategicPointList.length == 0){
        $("#clearStrategicPointList").addClass("disabled");
        $("#submitStrategicPointList").addClass("disabled");
    }
};

// Strategic Point Type Selector

$('#hybridTypeBtn:input').change(function () {
    $('#'+strategicPointType+'TypeLabel').removeClass('active');
    strategicPointType = 'hybrid';
    $('#'+strategicPointType+'TypeLabel').addClass('active');
})

$('#aerialTypeBtn:input').change(function () {
    $('#'+strategicPointType+'TypeLabel').removeClass('active');
    strategicPointType = 'aerial';
    $('#'+strategicPointType+'TypeLabel').addClass('active');
})

$('#groundTypeBtn:input').change(function () {
    $('#'+strategicPointType+'TypeLabel').removeClass('active');
    strategicPointType = 'ground';
    $('#'+strategicPointType+'TypeLabel').addClass('active');
})

// Strategic Point State Selector

$('#defusedStateBtn:input').change(function () {
    $('#defusedStateLabel').removeClass('active');
    $('#activeStateLabel').removeClass('active');
    $('#unalterableStateLabel').removeClass('active');
    strategicPointState = 0;
    $('#defusedStateLabel').addClass('active');
})

$('#activeStateBtn:input').change(function () {
    $('#defusedStateLabel').removeClass('active');
    $('#activeStateLabel').removeClass('active');
    $('#unalterableStateLabel').removeClass('active');
    strategicPointState = 1;
    $('#activeStateLabel').addClass('active');
})

$('#unalterableStateBtn:input').change(function () {
    $('#defusedStateLabel').removeClass('active');
    $('#activeStateLabel').removeClass('active');
    $('#unalterableStateLabel').removeClass('active');
    strategicPointState = 2;
    $('#unalterableStateLabel').addClass('active');
})

/// Map

map.on('click', function (e) {
    if (addingWaypoint && mode == 'navigation') {

        waypointList.push({
            "id": 'W'+currID,
            "latitude": e.latlng.lat,
            "longitude": e.latlng.lng
        });
        currID++;

        updateWaypointList(waypointList);
        updatePath();
    };
    if (addingCoverageArea && mode == 'exploration') {

        coverageAreaList.push({
            "id": 'A'+currCoverageAreaPointID,
            "latitude": e.latlng.lat,
            "longitude": e.latlng.lng
        });
        currCoverageAreaPointID++;

        updateCoverageAreaList(coverageAreaList);
        updatePolygon();
    };
    if (addingStrategicPoint && mode == 'tasks') {

        strategicPointList.push({
            "id": 'S'+currStrategicPointID,
            "latitude": e.latlng.lat,
            "longitude": e.latlng.lng,
            "type": strategicPointType,
            "state": strategicPointState,
            "radius": radiusInput.value
        });
        currStrategicPointID++;

        updateStrategicPointList(strategicPointList);
    };

    $('.listItem.active').removeClass("active");
});

/// Other functions

var publishWaypoint = function(waypoints) {
    let currentTime = new Date();
    let cohomaWaypoints = [];
    let secs = Math.floor(currentTime.getTime()/1000);
    let nsecs = Math.round(1000000000*(currentTime.getTime()/1000-secs));
    let input_altitude = document.getElementById("altitudeInput").value;
    waypoints.forEach(w => {
        let wayPoint = new ROSLIB.Message({
            position : {
                latitude : w.latitude,
                longitude : w.longitude,
                altitude : input_altitude
            },
            trap_clearance : false,
            reached : false
        });
        cohomaWaypoints.push(wayPoint);
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
        waypoints : cohomaWaypoints,
    });
    waypointPub.publish(missionPlan);
};

var unsubscribeTelemetryListener = function() {
    telemetryListenerList.forEach(listener => {
        listener.unsubscribe()
    })
    telemetryListenerList.length = 0; // clear array
};

/// Initialize

var polyline = L.polyline([], {weight: 6, opacity: 1, color: '#fb0'}).addTo(map);

var decorator = L.polylineDecorator(polyline, {
    patterns: [
        // defines a pattern of 10px-wide dashes, repeated every 100px on the line
        {offset: 25, repeat: 50, symbol: L.Symbol.arrowHead({pixelSize: 6, pathOptions: {fillOpacity: 1, weight: 0, color: '#555'}})}
    ]
}).addTo(map);

var polygon = L.polygon([]).addTo(map);