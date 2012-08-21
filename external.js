/**
 * External Server
 *
 * Responsibilities
 * <ul>
 *     <li>Receive data from local server</li>
 *     <li>Show website</li>
 * </ul>
 */

var express = require('express');
var socket = require('socket.io');
var fs = require('fs');
var winston = require('winston');
var http = require('http');
var main = require('./external/main.js');
var Config = require('./common/config.js');


// Configurationi
var app = express();

app.configure(function() {
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
});

app.configure('development', function() {
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function() {
    app.use(express.errorHandler());
});

// Remove default console output
winston.remove(winston.transports.Console);

// Add custom logging transports
winston.add(winston.transports.Console, {
    colorize: true,
    timestamp: true,
    handleExceptions: true,
    exitOnError: false
});

// Routes

app.get('/', function(request, response) {
    response.sendfile('./views/index2.html');
});

app.post('/init/data', function(request, response) {
    for (var prop in request.body) {
        request.body = prop;
    }
    main.initStats(JSON.parse(request.body));
    response.setHeader("200");
    response.end();
});
app.post('/user/welcome', function(request, response) {
    for (var prop in request.body) {
        request.body = prop;
    }
    main.welcomeUser(JSON.parse(request.body));
    response.setHeader("200");
    response.end();
});
app.post('/user/deny', function(request, response) {
    main.denyUser();
    response.setHeader("200");
    response.end();
});
app.post('/update/flow', function(request, response) {
    for (var prop in request.body) {
        request.body = prop;
    }
    main.updateFlow(JSON.parse(request.body));
    response.setHeader("200");
    response.end();
});
app.post('/update/amount', function(request, response) {
    for (var prop in request.body) {
        request.body = prop;
    }
    main.updateAmount(JSON.parse(request.body));
    response.setHeader("200");
    response.end();
});
app.post('/update/temp', function(request, response) {
    for (var prop in request.body) {
        request.body = prop;
    }
    main.updateTemp(JSON.parse(request.body));
    response.setHeader("200");
    response.end();
});
app.post('/update/keg', function(request, response) {
    for (var prop in request.body) {
        request.body = prop;
    }
    main.updateKeg(JSON.parse(request.body));
    response.setHeader("200");
    response.end();
});
app.post('/update/stats', function(request, response) {
    for (var prop in request.body) {
        request.body = prop;
    }
    main.updateStats(JSON.parse(request.body));
    response.setHeader("200");
    response.end();
});
app.post('/send/pic', function(request, response) {
    for (var prop in request.body) {
        request.body = prop;
    }
    var obj = JSON.parse(request.body);
    var picName = obj.picName;
    var file = obj.data;

    fs.write((Config.externalPictureLocation + picName), file, 'binary', function(error) {
        if (error) {
            winston.error(error);
        }
    });

    response.setHeader('200');
    response.end();
});
app.post('/show/achievements', function(request, response) {
    for (var prop in request.body) {
        request.body = prop;
    }
    winston.debug('Achievement: ' + request.body);

    var obj = JSON.parse(request.body);
    main.showAchievements(obj);
    response.setHeader('200');
    response.end();

});

var server = http.createServer(app);
server.listen(Config.externalPortRunner);

// Socket io
socket = socket.listen(server);

socket.configure(function() {
    socket.set('log level', 1);
});

socket.configure('production', function() {
    socket.enable('browser client minification');
    socket.enable('browser client etag');
    socket.enable('browser client gzip');
    socket.set('transports', [
        'websocket',
        'flashsocket',
        'htmlfile',
        'xhr-polling',
        'jsonp-polling'
    ])
});

main.start(socket.sockets);
