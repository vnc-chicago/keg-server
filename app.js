var express = require('express'),
    socket = require('socket.io'),
    fs = require('fs'),
    main = require('./libs/main.js'),
    index = require('./routes/index.js'),
    admin = require('./routes/admin.js'),
    log4js = require('log4js');


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

app.get('/', index.show);
app.get('/admin', admin.show);
app.post('/create/user', main.createUser);
app.post('/create/keg', main.createKeg);

app.get('/500', function(request, response) {
    response.render('500', { title: 'Internal server error' });
});

app.use(function(request, response) {
    response.render('404', { title: "Page not found" });
});

app.listen(3000);

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

main.start(config.debug, config.device, socket.sockets, logger);

logger.info("Express server listening on port " + app.address().port + " in " + app.settings.env + " mode");
