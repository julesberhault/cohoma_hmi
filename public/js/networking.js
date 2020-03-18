
var socket = io.connect();

socket.on('waypoints', function(wp){
    $('#newWPModal').modal('show');
    $("#updateSocketWP").click(function (event) {
        console.log(wp);
        $('#newWPModal').modal('hide');
        updateWPList(wp);
        updatePath();
    });
});

var sendWaypoints = function(wp) {
    socket.emit("newMission", wp);
};