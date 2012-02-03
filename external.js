/**
 * External Server
 *
 * Responsibilities
 * <ul>
 *     <li>Receive data from local server</li>
 *     <li>Show website</li>
 * </ul>
 */

var express = require('express'),
    socket = require('socket.io'),
    fs = require('fs'),
    log4js = require('log4js'),
    main = require('./externalLibs/main.js');


// Configuration
var app = express.createServer();

log4js.addAppender(log4js.consoleAppender);
log4js.addAppender(log4js.fileAppender('logs/app.log'));

var logger = log4js.getLogger('default');

var config = JSON.parse(
    fs.readFileSync("./conf/app_config.json").toString().replace(
        new RegExp("\\/\\*(.|\\r|\\n)*?\\*\\/", "g"),
        "" // strip out C-style comments (/* */)
    )
);

logger.debug("CONFIG:");
for (var prop in config) {
    if (config.hasOwnProperty(prop))
        logger.debug(prop + ": " + config[prop]);
}

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
    response.sendfile('./views/index.html');
});

app.post('/user/welcome', function(request, response) {
    for(var prop in request.body) {
        request.body = prop;
    }

    logger.debug(request.body);
    main.welcomeUser(JSON.parse(request.body));
});
app.post('/user/deny', function(request, response) {
    main.denyUser();
});
app.post('/update/flow', function(request, response) {
    for(var prop in request.body) {
        request.body = prop;
    }

    logger.debug(request.body);
    main.updateFlow(JSON.parse(request.body));
});
app.post('/update/amount', function(request, response) {
    for(var prop in request.body) {
        request.body = prop;
    }

    logger.debug(request.body);
    main.updateAmount(JSON.parse(request.body));
});
app.post('/update/temp', function(request, response) {
    for(var prop in request.body) {
        request.body = prop;
    }

    logger.debug(request.body);
    main.updateTemp(JSON.parse(request.body));
});
app.post('/update/keg', function(request, response) {
    for(var prop in request.body) {
        request.body = prop;
    }

    logger.debug(request.body);
    main.updateKeg(JSON.parse(request.body));
});

app.listen(8080);

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

main.start(socket.sockets);

logger.info("Express server listening on port " + app.address().port + " in " + app.settings.env + " mode");
