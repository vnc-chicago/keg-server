var EventEmitter = require('events').EventEmitter;
var protocol = require('../common/protocol');
var serialPort = require('serialport');
var Config = require('../common/config');

var KegIO = (function() {
    var VALID_MESSAGE = /\*{2}.+_.+\*{2}/i;
    var SerialPort = serialPort.SerialPort;
    var _port;
    var _logger;
    var _emitter;

    function init(logger) {
        _emitter = Object.create(EventEmitter.prototype);
        _logger = logger;

        if(!Config.isDebug) {
            _port = new SerialPort(Config.devicePath, {
                parser: serialPort.parsers.readline('\n')
            });

            _port.on('data', function(data) {
                parseMessage(data);
            })
        } else {
            fakeTemp();
            fakeTag();
        }
    }

    function getEmitter() {
        if(typeof _emitter === 'undefined') {
            _emitter = Object.create(EventEmitter.prototype);
        }
        return _emitter;
    }

    function parseMessage(message) {
        if(!validMessage(message)) {
            _logger.warn('Invalid arduino message: ' + message);
        } else {
            var startSlice = message.indexOf('_') + 1;
            var endSlice = message.indexOf('*', message.indexOf('_'));
            var data = message.slice(startSlice, endSlice);
            var event = message.slice(2, message.indexOf('_'));

            _logger.debug('Keg message: ' + event + ' - ' + data);

            _emitter.emit(event, data);
        }
    }

    function validMessage(message) {
        return VALID_MESSAGE.test(message);
    }

    function fakeTemp() {
        setInterval(function() {
            var temp = Math.random() * 10 + 35;
            parseMessage('**' + protocol.TEMP + '_' + temp + '**');
        }, 60000);
    }

    function fakeTag() {
        parseMessage('**' + protocol.TAG + '_' + '0123456789' + '**');

    }

    return {
        getEmitter : getEmitter,
        start : init
    }
}());
module.exports = KegIO;
