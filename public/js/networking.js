
var socket = io.connect();

socket.on('waypoints', function(wp){
    $('#newWPModal').modal('show');
    $("#updateSocketWP").click(function (event) {
        $('#newWPModal').modal('hide');
        updateWPList(wp);
        updatePath();
    });
});

var sendWaypoints = function(wp) {
    socket.emit("newMission", wp);
};