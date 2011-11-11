var fs = require('fs'),
    protocol = require('./protocol.js'),
    sys = require('sys'),
    util = require(process.binding('natives').util ? 'util' : 'sys');

/**
 * Model for keg interaction
 * Initializes all variables
 */
Keg = function() {
    process.EventEmitter.call(this);
    this.isDebug = false;
    this.reader = null;
    this.writer = null;
    this.logger = null;
};

util.inherits(Keg, process.EventEmitter);

exports.Keg = Keg;

/**
 *
 * @param device
 */
Keg.prototype.init = function(device, isDebug, logger) {
    this.logger = logger;
    this.validMessage = /\\*\\*.+_.+\\*\\*/i;
    this.isDebug = isDebug;
    if (!isDebug) {

        // attach reader to port
        this.reader = fs.createReadStream(device, { bufferSize: 1 });

        this.reader.addListener('error', this.onPortError);
        this.reader.addListener('open', this.onPortOpen);

        var id = '';
        this.reader.addListener('data', this.onReaderData, id);

        // attach writer to port
        this.writer = fs.createWriteStream(device);
        this.writer.addListener('error', this.onPortError);
        this.writer.addListener('open', this.onPortOpen);
    } else {
        this.fakePour();
        this.fakeTemp();
    }
};

Keg.prototype.onReaderData = function(data, id) {
    var c = data.toString('ascii').match(/.*/)[0]; // Only keep hex chars

    if (c == '') { // Found non-hex char
        if (id != '') // The ID isn't blank
            this.parseMessage(id);
        id = ''; // Prepare for the next ID chunks
        return;
    }

    id += c; // Add to the ID
};

Keg.prototype.parseMessage = function parseMessage(message) {

    // don't continue if the message received isn't valid
    if (!this.isValidMessage(message)) {
        this.logger.debug("Invalid Arduino Message : " + message);
        return;
    }

    // determine the type of message and emit the proper event
    for (var i = 0; i < protocol.messages.length; i++) {
        if (message.indexOf(protocol.messages[i]) >= 0) {
            var startSlice = message.indexOf('_') + 1;
            var endSlice = message.indexOf('*', message.indexOf('_'));

            var data = message.slice(startSlice, endSlice);

            var eventName = protocol.messages[i];

            switch (protocol.messages[i]) {
                case protocol.FLOW:
                    break;
                case protocol.POUR:
                    break;
                case protocol.TAG:
                    break;
                case protocol.TEMP:
                    break;
                default:
                    this.logger.warn('Invalid arduino message : ' + message);
            }

            this.emit(eventName, data);
        }
    }
};

Keg.prototype.isValidMessage = function(message) {
    var result = null;
    if (message)
        result = (this.validMessage).exec(message);
    return result && result[0] == message;
};

Keg.prototype.onPortError = function() {
    logger.error('Error from serial port');
    logger.error('Check serial device configuration');
    process.exit(1);
};

Keg.prototype.onPortOpen = function() {
    logger.info('Serial port open');
};

Keg.prototype.openValve = function() {
    this.writer.write(protocol.REQUEST_OPEN);
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
    if(randomUser != 4)
        self.fakeFlow(10, user); // flow for 10 seconds

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
        var randomTemp = randomTemp + (Math.floor(Math.random() * 10) - 5); // between -5 and 5
        // yields a temp between 35 and 45
        self.parseMessage("**TEMP_" + randomTemp + "**");
        setTimeout(self.fakeTemp(), frequencyInMs);
    }, frequencyInMs);
};
