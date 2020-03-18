var waypoints = [];

var socket = io.connect();

socket.on('waypoints', function(wp){
    waypoints = wp;
    
});

var sendWaypoints = function(wp) {
    socket.emit(wp);
};

var testModal = function() {
    $('#newWPModal').modal('show')
}