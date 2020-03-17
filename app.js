var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var path = require('path');
var routes = require('./routes/index');
var bodyParser = require('body-parser');

const mongoose = require('mongoose');
require('./models/Attitude');
const Attitude = mongoose.model('Attitude');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/', routes);
app.use(express.static('public'));

module.exports = app;

io.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
});
/*
const attitude = new Attitude(JSONdata);
attitude.save()
  .then(() => { res.send(attitude); })
  .catch((err) => {
    console.log(err);
    res.send('Sorry! Something went wrong.');
  });*/