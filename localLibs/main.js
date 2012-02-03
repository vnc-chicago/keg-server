var db_io = require('./db.io.js'),
    keg_io = require('./keg.io.js'),
    protocol = require('../libs/protocol.js'),
    web_io = require('./web.io.js'),
    logger = null,
    keg = null,
    isDebug = null,
    devicePath = null,
    currentKeg = null,
    currentDrinker = null,
    lastDrinker = null,
    isUserEntry = null,
    firstName = null,
    lastName = null,
    affiliation = null;

exports.start = function(loggerInstance, deviceInstance, isDebugInstance, socketsInstance) {
    logger = loggerInstance;
    devicePath = deviceInstance;
    isDebug = isDebugInstance;
    db_io.start(_continueSetup, loggerInstance);
    web_io.start(socketsInstance, loggerInstance, this);
};

exports.promptUser = function(user) {
    isUserEntry = true;
    firstName = user.firstName;
    lastName = user.lastName;
    affiliation = user.affiliation;
    web_io.promptUser();
}

function _continueSetup(error) {
    if(error == undefined) {
        // Setup keg handlers
        keg = new keg_io.Keg();
        keg.init(devicePath, isDebug, logger);

        keg.addEventlistener(protocol.FLOW, _handleFlow);
        keg.addEventlistener(protocol.TEMP, _handleTemp);
        keg.addEventlistener(protocol.TAG, _handleTag);
        keg.addEventlistener(protocol.POUR, _handlePour);

        // Populate variables
        db_io.getCurrentKeg(function(keg) {
            currentKeg = keg;
        });

        db_io.getLastDrinker(function(user) {
            lastDrinker = user;
        });
    } else {
        logger.error(error);
    }
}

function _handleFlow(flow) {
    web_io.updateFlow(flow);
}

function _handleTemp(temp) {
    // Store status if currentKeg exists
    if(currentKeg != undefined) {
        var status = new Object();
        status.kegId = currentKeg.id;
        status.amount = currentKeg.amount;
        status.temperature = temp;
        db_io.createKegStatus(status, function() {} );
    }
    web_io.updateTemperature(temp);
}

function _handleTag(tag) {
    if(isUserEntry) {
        var user = new Object();
        user.name = firstName + " " + lastName;
        user.affiliation = affiliation;
        user.tag = tag;
        db_io.createUser(user, function(error) {
            if(error == undefined) {
                web_io.createSuccess();
            } else {
                web_io.createFail(error);
            }
        });
    } else {
        // Get user
        db_io.getUserByRFID(tag, function(user) {
            if(user != undefined) {
                // If valid
                // Store as currentDrinker
                currentDrinker = user;
                keg.openValve();
                web_io.welcomeUser(user);
            } else {
                web_io.denyUser();
            }
        });
    }
}

function _handlePour(pour) {
    if(currentKeg) {
        // Store pour
        var record = new Object();
        record.kegId = currentKeg.id;
        record.amount = pour;
        record.userId = currentDrinker.id;
        db_io.createKegPour(record, function(error) {
            if(error == undefined) {
                _checkPour(pour, function() {
                    lastDrinker = currentDrinker;
                    currentDrinker = null;
                    web_io.updateStats();
                });
            }
        });
    } else {
        logger.warn("No keg, how did we pour?");
    }
}

function _checkPour(pour, callback) {
    callback();
}