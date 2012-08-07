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
var http = require('http');
var fs = require('fs');
var winston = require('winston');
var index = require('./routes/index');
var Config = require('./common/config');
var main = require('./local/main');


// Configuration
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
})

// Routes

app.get('/', function(request, response) {
    index.show(request, response, main);
    //response.sendfile('./views/index2.html');
});

app.post('/create/keg', function(request, response) {
    response.redirect('/');
    main.createKeg(request.body.keg);
});

app.post('/create/user', function(request, response) {
    response.redirect('/');

    setTimeout(function() {
        main.promptUser(request.body.user);
    }, 1000)
});

app.post('/set/admin', function(request, response) {
    main.setIsUserCreation(!main.getIsUserCreation());
    response.redirect('/');
});

app.get('/500', function(request, response) {
    response.render('500', { title: 'Internal server error' });
});

app.listen(Config.localPort);

main.start(http.createServer(app));
