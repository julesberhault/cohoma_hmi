var socket = io.connect();

var sendMode = function(newMode) {
    socket.emit("setMode", newMode);
};