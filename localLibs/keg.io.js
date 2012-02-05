var fs = require('fs'),
    protocol = require('../libs/protocol.js'),
    sys = require('sys'),
    util = require(process.binding('natives').util ? 'util' : 'sys'),
    serialPort = require("serialport"),
    SerialPort = serialPort.SerialPort,
    logger;

/**
 * @author Erik Karlsson, www.nonobtrusive.com
 */
function Dispatcher() {
    this.events = [];
}
Dispatcher.prototype.addEventlistener = function(event, callback) {
    this.events[event] = this.events[event] || [];
    if (this.events[event]) {
        this.events[event].push(callback);
    }
};

Dispatcher.prototype.removeEventlistener = function(event, callback) {
    if (this.events[event]) {
        var listeners = this.events[event];
        for (var i = listeners.length - 1; i >= 0; --i) {
            if (listeners[i] === callback) {
                listeners.splice(i, 1);
                return true;
            }
        }
    }
    return false;
};

Dispatcher.prototype.dispatch = function(event, data) {
    if (this.events[event]) {
        var listeners = this.events[event], len = listeners.length;
        while (len--) {
            listeners[len](data);	//callback with self
        }
    }
};

/**
 * Model for keg interaction
 * Initializes all variables
 */
Keg = function() {
    Dispatcher.call(this);
    this.isDebug = false;
    this.port = null;
};


exports.Keg = Keg;

Keg.prototype = new Dispatcher();

/**
 * Initialize function for keg communication
 * @param deviceInstance - the device port to connect to
 * @param isDebugInstance
 * @param loggerInstance
 */
Keg.prototype.init = function(deviceInstance, isDebugInstance, loggerInstance) {
    logger = loggerInstance;
    this.validMessage = /\*{2}.+_.+\*{2}/i;
    this.isDebug = isDebugInstance;
    var self = this;
    if (!isDebugInstance) {

        // attach reader to port
        this.port = new SerialPort(deviceInstance, {
            parser: serialPort.parsers.readline("\n")
        });

        this.port.on("data", function(data) {
            self.parseMessage(data);
        });

    } else {
        this.fakeTemp();
        this.fakePour();
    }
};

Keg.prototype.parseMessage = function parseMessage(message) {
    // don't continue if the message received isn't valid
    if (!this.isValidMessage(message)) {
        logger.debug("Invalid Arduino Message : " + message);
        return;
    }

    // determine the type of message and emit the proper event
    for (var i = 0; i < protocol.messages.length; i++) {
        if (message.indexOf(protocol.messages[i]) >= 0) {
            var startSlice = message.indexOf('_') + 1;
            var endSlice = message.indexOf('*', message.indexOf('_'));

            var data = message.slice(startSlice, endSlice);
            var eventName = protocol.messages[i];
            this.dispatch(eventName, data);
        }
    }
};

Keg.prototype.isValidMessage = function(message) {
    var result = null;
    if (message)
        result = (this.validMessage).test(message);
    return result;
};

Keg.prototype.onPortError = function() {
    logger.error('Error from serial port');
    logger.error('Check serial device configuration');
    process.exit(1);
};

Keg.prototype.onPortOpen = function() {
    if (logger != undefined) {
        logger.info('Serial port open');
    }
};

Keg.prototype.openValve = function() {
    logger.debug(protocol.REQUEST_OPEN);
    if(!this.isDebug) {
        this.port.write(protocol.REQUEST_OPEN);
    }
};

Keg.prototype.fakeFlow = function fakeFlow(flowsLeft, user) {
    var frequencyInMs = 1000; // repeat every second
    var self = this;

    if (flowsLeft > 0) {
        var randomFlow = (Math.floor(Math.random() * 51)) + 30; // between 30-80;
        user.pouredLength += 0.00563567045 * randomFlow;

        setTimeout(function() {
            self.parseMessage("**FLOW_" + randomFlow + "**");
            setTimeout(self.fakeFlow(flowsLeft - 1, user), frequencyInMs);
        }, frequencyInMs);
    }
    else {
        self.parseMessage('**FLOW_0**');
        self.parseMessage('**FLOW_END**');
        self.parseMessage('**POUR_' + user.pouredLength + '**');

    }
};

Keg.prototype.fakePour = function fakePour() {
    var frequencyInMs = 25000; // repeat every 25 seconds
    var self = this;

    // Select a random user, using values that we "know" are in the DB,
    // (based on the fact that they're hardcoded into the DB rebuild script)
    var randomUser = Math.floor(Math.random() * 5); // between 0-4
    var userRFID = "DENYTAG544";
    var user = new Object();
    switch (randomUser) {
        case 0:
            userRFID = "0123456789"; // Jay
            break;
        case 1:
            userRFID = "1234567890"; // Kurt
            break;
        case 2:
            userRFID = "2345678901"; // Tom
            break;
        case 3:
            userRFID = "3456789012"; // Gaylord
            break;
    }
    user.badgeId = userRFID;
    user.pouredLength = 0;

    this.parseMessage("**TAG_" + userRFID + "**");
    if (randomUser != 4) {
        setTimeout(function() {
            self.fakeFlow(10, user); // flow for 10 seconds
        }, 5000);
    }

    setTimeout(function() {
        setTimeout(self.fakePour(), frequencyInMs);
    }, frequencyInMs);
};

// Produces a fake "temp" event on a given interval, used in development mode
Keg.prototype.fakeTemp = function fakeTemp() {
    var frequencyInMs = 5000; // repeat every 5 seconds
    var self = this;

    setTimeout(function() {
        var randomTemp = 40; // start at 40
        randomTemp = randomTemp + (Math.floor(Math.random() * 10) - 5); // between -5 and 5
        // yields a temp between 35 and 45
        self.parseMessage("**TEMP_" + randomTemp + "**");
        setTimeout(self.fakeTemp(), frequencyInMs);
    }, frequencyInMs);
};
