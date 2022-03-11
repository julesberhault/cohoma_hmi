require('dotenv').config();
const express = require('express');
var app = express();

const server = require('http').createServer(app);
const io = require('socket.io')(server);

const path = require('path');
const routes = require('./routes/index');
const bodyParser = require('body-parser');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(bodyParser.urlencoded({extended: true}));
app.use('/', routes);
app.use(express.static('public'));

module.exports = server;

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

var waypointList = [];
var mode = 'navigation';
var centeredLocation = {lat: 48.711252, lng: 2.217757};

io.on('connection', function (socket) {
    console.log("Someone is connected !")

    socket.on('setMode', function (newMode) {
        console.log(newMode);
        mode = newMode;
    });

    socket.on('getMode', function () {
        socket.emit('currentMode', mode);
    });
  
    socket.on('setWaypointList', function (newWaypointList) {
        console.log(newWaypointList);
        waypointList = newWaypointList;
    });
  
    socket.on('getWaypointList', function () {
        socket.emit('currentWaypointList', waypointList);
    });

    socket.on('setCenteredLocation', function (newCenteredLocation) {
        centeredLocation = newCenteredLocation;
    });
  
    socket.on('getCenteredLocation', function () {
        socket.emit('currentCenteredLocation', centeredLocation);
    });
});

const address = server.listen(8000, () => {
    console.log(`Node server running on port ${address.address().port}`);
});
