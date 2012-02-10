/**
 * Local Server
 *
 * Responsibilities
 * <ul>
 *     <li>Receive data from keg hardware</li>
 *     <li>Store data into db</li>
 *     <li>Administrate user and keg creation</li>
 * </ul>
 */

var express = require('express');
var socket = require('socket.io');
var fs = require('fs');
var log4js = require('log4js');
var Config = require('./common/Config.js') 


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

app.listen(Config.localPort);

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

logger.info("Express server listening on port " + app.address().port + " in " + app.settings.env + " mode");
