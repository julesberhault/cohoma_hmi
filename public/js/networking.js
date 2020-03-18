var waypoints = [];

var socket = io.connect();

socket.on('waypoints', function(wp){
    $('#newWPModal').modal('show');
    $("#updateSocketWP").click(function (event) {
        waypoints = wp;
        $('#newWPModal').modal('hide');
    });
});

var sendWaypoints = function(wp) {
    socket.emit(wp);
};