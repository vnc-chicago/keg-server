var io = require('socket.io');
var http = require('http');
var EventEmitter = require('events').EventEmitter;
var Config = require('../common/config');

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
      var data = JSON.stringify(user);
      var request = http.request(generatePost('/user/welcome', data));
      request.write(data);
      request.end();
    }

    function denyUser(user) {
      var data = '';
      var request = http.request(generatePost('/user/deny', data));
      request.write(data);
      request.end();
    }

    function updateFlow(flow) {
      var obj = {flow: flow};
      var data = JSON.stringify(obj);
      var request = http.request(generatePost('/update/flow', data));
      request.write(data);
      request.end();
    }

    function updateTemp(temp) {
      var obj = {temp: temp};
      var data = JSON.stringify(obj);
      var request = http.request(generatePost('/update/temp', data));
      request.write(data);
      request.end();
    }

    function updateKeg(keg) {
      var data = JSON.stringify(keg);
      var request = http.request(generatePost('/update/keg', data));
      request.write(data);
      request.end();
    }

    function updateStats(stats) {

    }

    function generatePost(path, data) {
      var postOptions = {
        host: Config.externalServerUrl,
        port: Config.externalPortListener,
        path: path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': data.length
        }
      };
      return postOptions;
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
        updateKeg : updateKeg,
        updateStats : updateStats
    }

}());
module.exports = WebIO;
