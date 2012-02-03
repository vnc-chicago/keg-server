/**
 * Local server
 *
 * Responsibilities
 * <ul>
 *     <li>Interact with keg</li>
 *     <li>Store data</li>
 *     <li>Register users</li>
 *     <li>Push to external server</li>
 * </ul>
 */

var express = require('express'),
    socket_io = require('socket.io'),
    fs = require('fs'),
    log4js = require('log4js'),
    index = require('./routes/index.js'),
    main = require('./localLibs/main.js');


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

app.get('/', function(request, response){
    index.show(request, response);
});

app.post('/create/user', function(request, response) {
    response.redirect('/');

    setTimeout(function() {
        main.promptUser(request.body.user);
    }, 1000);
});

app.get('/500', function(request, response) {
    response.render('500', { title: 'Internal server error' });
});

app.use(function(request, response) {
    response.render('404', { title: "Page not found" });
});

app.listen(3000);

// Socket io
var io = socket_io.listen(app);

io.configure(function() {
    io.set('log level', 1);
});

io.configure('production', function() {
    io.enable('browser client minification');
    io.enable('browser client etag');
    io.enable('browser client gzip');
    io.set('transports', [
        'websocket',
        'flashsocket',
        'htmlfile',
        'xhr-polling',
        'jsonp-polling'
    ])
});

main.start(logger, config["devicePath"], config["isDebug"], io.sockets);

logger.info("Express server listening on port " + app.address().port + " in " + app.settings.env + " mode");
