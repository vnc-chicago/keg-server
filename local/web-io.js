var io = require('socket.io');
var EventEmitter = require('events').EventEmitter;

var WebIO = (function() {
    var clients = [];
    var _emitter;
    var _logger;

    function init(app, logger) {
        _emitter = Object.create(EventEmitter.prototype);
        _logger = logger;

        // Socket io
        io = io.listen(app);

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
        io.sockets.on('connection', _onConnection);
    }

    function getEmitter() {
        if(typeof _emitter === 'undefined') {
            _emitter = Object.create(EventEmitter.prototype);
        }
        return _emitter;
    }

    function welcomeUser(user) {

    }

    function denyUser(user) {

    }

    function updateFlow(flow) {

    }

    function updateTemp(temp) {

    }

    function updateKeg(keg) {

    }

    function updateStats(stats) {

    }

    function _onConnection(client) {
        clients.push(client);

        client.on('disconnect', function() {
            clients.splice(clients.indexOf(client), 1);
        });

        client.on('createUser', function() {
            // Create user
            WebIO.emit('createUser', {user : {}});
        });

        client.on('createKeg', function() {
            // Create keg
            WebIO.emit('createKeg', {keg : {}});
        });
    }

    return {
        getEmitter : getEmitter,
        start : init,
        welcomeUser : welcomeUser,
        denyUser : denyUser,
        updateFlow : updateFlow,
        updateTemp : updateTemp,
        updateKeg : updateKeg(),
        updateStats : updateStats
    }

}());
module.exports = WebIO;
