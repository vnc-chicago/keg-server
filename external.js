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
var log4js = require('log4js');
var main = require('./external/main.js');
var Config = require('./common/config.js');


// Configuration
var app = express.createServer();

log4js.addAppender(log4js.consoleAppender);
log4js.addAppender(log4js.fileAppender('logs/app.log'));

var logger = log4js.getLogger('default');

app.configure(function() {
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(log4js.connectLogger(logger, { level: log4js.levels.INFO }));
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
    var fullData = '';
    request.on('data', function(chunk) {
        fullData += chunk;
    });

    request.on('end', function() {
        var obj = JSON.parse(fullData);
        var picName = obj.picName;
        var file = obj.data;

        fs.write((Config.externalPictureLocation + picName), file, 'binary', function(error) {
            if(error) {
                logger.error(error);
            }
        });
    });
});

app.listen(Config.externalPortRunner);

// Socket io
socket = socket.listen(app);

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

main.start(socket.sockets, logger);

logger.info("Express server listening on port " + app.address().port + " in " + app.settings.env + " mode");
