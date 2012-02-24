var io = require('socket.io');
var fs = require('fs');
var http = require('http');
var EventEmitter = require('events').EventEmitter;
var Config = require('../common/config');

var WebIO = (function() {
    var _client;
    var _logger;

    function init(app, logger) {
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

    function pushInitialStats(stats) {
        if(typeof stats.currentKeg === 'undefined') {
            stats.currentKeg = '';
        }
        if(typeof stats.lastUser === 'undefined') {
            stats.lastUser = '';
        }
        var data = JSON.stringify(stats);
        var request = http.request(generateDataPost('/init/data', data));
        request.write(data);
        request.end();
    }

    function promptForCard() {
        _client.emit('promptForCard');
    }

    function promptForPicture() {
        _client.emit('promptForPic');
    }

    function pushPicture(picName, callback) {
        fs.readFile(Config.localPictureLocation + picName + Config.pictureType, 'binary', function(error, file) {
            if(error) {
                _logger.error(error);
                _client.emit('createFailure', {error: 'Picture failed to transfer'});
                callback(error);
            } else {
                _logger.debug('Pic Name: ' + picName);
                var obj = {
                    picName : (picName + Config.pictureType),
                    data : file
                };
                var data = JSON.stringify(obj);
                var request = http.request(generateDataPost('/send/pic', data));
                request.write(data);
                request.end();
            }
        })
    }

    function createSuccess() {
        _client.emit('createSuccess');
    }

    function createFail(error) {
        _client.emit('createFailure', {error: error});
    }

    function welcomeUser(user) {
        var data = JSON.stringify(user);
        var request = http.request(generateDataPost('/user/welcome', data));
        request.write(data);
        request.end();
    }

    function denyUser(user) {
        var data = '';
        var request = http.request(generateDataPost('/user/deny', data));
        request.write(data);
        request.end();
    }

    function updateFlow(flow) {
        var obj = {flow: flow};
        var data = JSON.stringify(obj);
        var request = http.request(generateDataPost('/update/flow', data));
        request.write(data);
        request.end();
    }

    function updateTemp(temp) {
        var obj = {temp: temp};
        var data = JSON.stringify(obj);
        var request = http.request(generateDataPost('/update/temp', data));
        request.write(data);
        request.end();
    }

    function updateKeg(keg) {
        var data = JSON.stringify(keg);
        var request = http.request(generateDataPost('/update/keg', data));
        request.write(data);
        request.end();
    }

    function updateStats(stats) {
        var data = JSON.stringify(stats);
        var request = http.request(generateDataPost('/update/stats', data));
        request.write(data);
        request.end();
    }

    function pushAchievements(achievements) {
        var data = JSON.stringify(achievements);
        _logger.debug('Achievements: ' + data);
        var request = http.request(generateDataPost('/show/achievements', data));
        request.write(data);
        request.end();
    }

    function generateDataPost(path, data) {
        return {
            host: Config.externalServerUrl,
            port: Config.externalPortListener,
            path: path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': data.length
            }
        };
    }

    function _onConnection(client) {
        _client = client;

        client.on('disconnect', function() {
            _client = null;
        });
    }

    return {
        start : init,
        pushInitialData : pushInitialStats,
        promptForCard : promptForCard,
        promptForPic : promptForPicture,
        createUserSuccess : createSuccess,
        createUserFail : createFail,
        welcomeUser : welcomeUser,
        denyUser : denyUser,
        updateFlow : updateFlow,
        updateTemp : updateTemp,
        updateKeg : updateKeg,
        updateStats : updateStats,
        sendPicture : pushPicture,
        pushAchievements: pushAchievements
    }

}());
module.exports = WebIO;
