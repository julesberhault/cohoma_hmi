var socket = io.connect();

var sendWaypoint = function(newWaypointList) {
    socket.emit("setWaypointList", newWaypointList);
};

var sendMode = function(newMode) {
    socket.emit("setMode", newMode);
};

var sendCenteredLocation = function(newCenteredLocation) {
    socket.emit("setCenteredLocation", newCenteredLocation);
};