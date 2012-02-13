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

        if (!Config.isDebug) {
            _port = new SerialPort(Config.devicePath, {
                parser: serialPort.parsers.readline('\n')
            });

            _port.on('data', function(data) {
                parseMessage(data);
            })
        } else {
            setTimeout(function() {
                fakeTemp();
                fakeTag();
            }, 5000);
        }
    }

    function getEmitter() {
        if (typeof _emitter === 'undefined') {
            _emitter = Object.create(EventEmitter.prototype);
        }
        return _emitter;
    }

    function parseMessage(message) {
        if (!validMessage(message)) {
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

    function openValve() {
        _logger.debug(protocol.REQUEST_OPEN);
        if (!Config.isDebug) {
            _port.write(protocol.REQUEST_OPEN);
        } else {
            fakeFlow(10);
        }
    }

    function fakeTemp() {
        setInterval(function() {
            var temp = Math.random() * 10 + 35;
            parseMessage('**' + protocol.TEMP + '_' + temp + '**');
        }, 60000);
    }

    function fakeTag() {
        setInterval(function() {
            var randomUser = Math.floor(Math.random() * 5);
            var RFID = 'DENYTAG012';
            switch (randomUser) {
                case 0:
                    RFID = '0123456789';
                    break;
                case 1:
                    RFID = '1234567890';
                    break;
                case 2:
                    RFID = '2345678901';
                    break;
                case 3:
                    RFID = '3456789012';
                    break;
                default:
                    break;
            }
            parseMessage('**' + protocol.TAG + '_' + RFID + '**');
        }, 15000);

    }

    function fakeFlow(timeLeft) {
        var flow = Math.random() * 100;
        parseMessage('**' + protocol.FLOW + '_' + flow + '**');
        if (timeLeft >= 0) {
            setTimeout(function() {
                fakeFlow(timeLeft - 1);
            }, 1000);
        } else {
            parseMessage('**' + protocol.FLOW + '_END**');
        }
    }

    return {
        getEmitter : getEmitter,
        start : init,
        openValve : openValve
    }
}());
module.exports = KegIO;
