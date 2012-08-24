var EventEmitter = require('events').EventEmitter;
var protocol = require('../common/protocol');
var serialPort = require('serialport');
var Config = require('../common/config');
var winston = require('winston');

var KegIO = (function() {
    var VALID_MESSAGE = /\*{2}.+_.+\*{2}/i;
    var SerialPort = serialPort.SerialPort;
    var _port;
    var _emitter;
    var debugFlow = false;

    function init(logger) {
        _emitter = Object.create(EventEmitter.prototype);

        if (!Config.isDebug) {
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
        if (typeof _emitter === 'undefined') {
            _emitter = Object.create(EventEmitter.prototype);
        }
        return _emitter;
    }

    function parseMessage(message) {
        if (!validMessage(message)) {
            winston.warn('Invalid arduino message: ' + message);
        } else {
            var startSlice = message.indexOf('_') + 1;
            var endSlice = message.indexOf('*', message.indexOf('_'));
            var data = message.slice(startSlice, endSlice);
            var event = message.slice(2, message.indexOf('_'));

            winston.debug('Keg message: ' + event + ' - ' + data);

            _emitter.emit(event, data);
        }
    }

    function validMessage(message) {
        return VALID_MESSAGE.test(message);
    }

    function openValve() {
        winston.debug(protocol.REQUEST_OPEN);
        if (!Config.isDebug) {
            _port.write(protocol.REQUEST_OPEN);
        } else {
            fakeFlow(10);
        }
    }

    function closeValve() {
        if (!Config.isDebug) {
            _port.write(protocol.REQUEST_CLOSE);
        }
    }

    function fakeTemp() {
        setInterval(function() {
            var temp = Math.random() * 10 + 35;
            parseMessage('**' + protocol.TEMP + '_' + temp + '**');
        }, 60000);
    }

    function fakeTag() {
        var RFID = 'DENYTAG012';
        if (Config.isAdminDebug) {
            RFID = randomTag();
        } else {
            var randomUser = Math.floor(Math.random() * 4);
            switch (randomUser) {
                case 0:
                    RFID = 'a123456789';
                    break;
                case 1:
                    RFID = '123456789a';
                    break;
                case 2:
                    RFID = '23456789a1';
                    break;
                default:
                    RFID = 'a123456789';
                    break;
            }
        }
        parseMessage('**' + protocol.TAG + '_' + RFID + '**');
        setTimeout(fakeTag, Math.random() * 20000);
    }

    function fakeFlow(timeLeft) {
        if(!debugFlow) {
            debugFlow = true;
            var flow = Math.random() * 2;
            parseMessage('**' + protocol.FLOW + '_' + flow + '**');
            if (timeLeft >= 0) {
                setTimeout(function() {
                    fakeFlow(timeLeft - 1);
                }, 500);
            }
        } else {
            debugFlow = false;
        }
    }

    function randomTag() {
        var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        var result = '';
        for (var i = 0; i < 10; i++) {
            var index = Math.floor((Math.random() * chars.length));
            result += chars.charAt(index);
        }
        return result;
    }

    return {
        getEmitter : getEmitter,
        start : init,
        openValve : openValve,
        closeValve : closeValve
    }
}());
module.exports = KegIO;
