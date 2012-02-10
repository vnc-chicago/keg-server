var db_io = require('./db.io.js');
var keg_io = require('./keg.io.js');
var protocol = require('../libs/protocol.js');
var web_io = require('./web.io.js');
var camera = require('../libs/camera.js');

exports.STATE = {
    hasCamera : false,
    alwaysOpen : false,
    isDebug : false,
    isUserEntry : false,
    devicePath : "",
    keg : null,
    currentKeg : null,
    currentDrinker : null,
    lastDrinker : null,
    firstName : '',
    lastName : '',
    affiliation : ''
};

var logger;

exports.start = function(loggerInstance, deviceInstance, isDebugInstance, socketsInstance, hasCameraInstance, alwaysOpenInstance) {
    exports.STATE['hasCamera'] = hasCameraInstance;
    exports.STATE['alwaysOpen'] = alwaysOpenInstance;
    logger = loggerInstance;
    exports.STATE['devicePath'] = deviceInstance;
    exports.STATE['isDebug'] = isDebugInstance;
    db_io.start(function() {
        setTimeout(_continueSetup, 5000);
    }, loggerInstance);
    web_io.start(socketsInstance, loggerInstance, this);
    setTimeout(_updateStats, 5000);
};

exports.promptUser = function(user) {
    exports.STATE['firstName'] = user.firstName;
    exports.STATE['lastName'] = user.lastName;
    exports.STATE['affiliation'] = user.affiliation;
    web_io.promptUser();
};

exports.createKeg = function(keg) {
    var kegData = {
        brewer : keg.brewer,
        name : keg.name,
        description : keg.description
    };
    db_io.createKeg(kegData, function(error) {
        if(error) {
            logger.error(error);
        } else {
            _updateStats();
        }
    });
};

function _continueSetup(error) {
    if (error == undefined) {
        // Setup keg handlers
        exports.STATE['keg'] = new keg_io.Keg();
        exports.STATE['keg'].init(exports.STATE['devicePath'], exports.STATE['isDebug'], logger);

        exports.STATE['keg'].addEventlistener(protocol.FLOW, _handleFlow);
        exports.STATE['keg'].addEventlistener(protocol.TEMP, _handleTemp);
        exports.STATE['keg'].addEventlistener(protocol.TAG, _handleTag);
        exports.STATE['keg'].addEventlistener(protocol.POUR, _handlePour);

        // Populate variables
        db_io.getCurrentKeg(function(keg) {
            exports.STATE['currentKeg'] = keg;
            web_io.collectCurrentKeg(keg);
        });

        db_io.getLastDrinker(function(user) {
            if (user != undefined) {
                exports.STATE['lastDrinker'] = user;
                exports.STATE['lastDrinker'].scanTime = new Date().getTime();
                web_io.collectLastUser(user);
            }
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
    if (exports.STATE['currentKeg'] != undefined) {
        var status = new Object();
        status.kegId = exports.STATE['currentKeg'].id;
        status.amount = exports.STATE['currentKeg'].amount;
        status.temperature = temp;
        db_io.createKegStatus(status, function() {
        });
    }
    web_io.updateTemperature(temp);
}

function _handleTag(tag) {
    logger.debug('Tag: ' + tag);
    if (exports.STATE['isUserEntry']) {
        db_io.getUserByRFID(tag, function(user) {
            if (user === undefined) {
                var user = new Object();
                user.name = exports.STATE['firstName'] + " " + exports.STATE['lastName'];
                user.affiliation = exports.STATE['affiliation'];
                user.tag = tag;
                if (exports.STATE['hasCamera']) {
                    web_io.promptForPicture();
                    _takePicture(user);
                } else {
                    _createUser(user);
                }
            }
        });
    } else {
        // Get user
        db_io.getUserByRFID(tag, function(user) {
            if (!exports.STATE['alwaysOpen']) {
                if (user != undefined) {
                    // If valid
                    if (exports.STATE['lastDrinker'] !== null && exports.STATE['currentDrinker'] === null) {
                        var now = new Date().getTime();
                        var diff = now - exports.STATE['lastDrinker'].scanTime;

                        if (diff > 30000) {
                            // Store as currentDrinker
                            exports.STATE['currentDrinker'] = user;
                            exports.STATE['currentDrinker'].scanTime = new Date().getTime();
                            exports.STATE['keg'].openValve();
                            web_io.welcomeUser(user);
                        }

                    } else if (exports.STATE['lastDrinker'] === null) {
                        // Store as currentDrinker and lastDrinker
                        exports.STATE['currentDrinker'] = user;
                        exports.STATE['currentDrinker'].scanTime = new Date().getTime();
                        exports.STATE['lastDrinker'] = user;
                        exports.STATE['lastDrinker'].scanTime = new Date().getTime();
                        exports.STATE['keg'].openValve();
                        web_io.welcomeUser(user);
                    }
                } else {
                    web_io.denyUser();
                }
            } else {
                exports.STATE['keg'].openValve();
            }
        });
    }
}

function _takePicture(user) {
    setTimeout(function() {
        logger.debug("Take Picture: " + user.name);
        var cam = new camera();
        cam.snap(user.tag);
        cam.on('done', function() {
            _createUser(user);
        })
    }, 3000);
}

function _createUser(user) {
    db_io.createUser(user, function(error) {
        if (error == undefined) {
            web_io.createSuccess();
        } else {
            web_io.createFail(error.toString());
        }
    });
}

function _handlePour(pour) {
    logger.debug('Pour: ' + pour);
    if (!exports.STATE['alwaysOpen']) {
        if (exports.STATE['currentKeg'] && exports.STATE['currentDrinker']) {
            // Store pour
            var record = new Object();
            record.kegId = exports.STATE['currentKeg'].id;
            record.amount = pour;
            record.userId = exports.STATE['currentDrinker'].badgeId;
            db_io.createKegPour(record, function(error) {
                if (error == undefined) {
                    _checkPour(pour, function() {
                        exports.STATE['lastDrinker'] = exports.STATE['currentDrinker'];
                        exports.STATE['currentDrinker'] = null;
                        _updateStats();
                    });
                }
            });
        } else {
            exports.STATE['currentDrinker'] = null;
            logger.error("No keg or user, how did we pour?");
        }
    }
}

function _updateStats() {
    db_io.getCurrentKeg(function(keg) {
        if (keg !== undefined) {
            exports.STATE['currentKeg'] = keg;
            web_io.updateKeg(keg);
        }
    });

    db_io.getLastDrinker(function(user) {
        if(user !== undefined) {
            web_io.update
        }
    })


    var stats = new Object();
    db_io.getAllTimePourAmountsPerPerson(function(rows) {
        if (rows.length > 0) {
            stats['allTimePourAmountsPerPerson'] = _generatePerPersonObject(rows);
        } else {
            stats['allTimePourAmountsPerPerson'] = new Object();
        }
        db_io.getAllTimePourAmountsPerTime(function(rows2) {
            if (rows2.length > 0) {
                stats['allTimePourAmountsPerTime'] = _generatePerTimeObject(rows2);
            } else {
                stats['allTimePourAmountsPerTime'] = new Object();
            }
            db_io.getKegPourAmountsPerPerson(function(rows3) {
                if (rows3.length > 0) {
                    stats['kegPourAmountsPerPerson'] = _generatePerPersonObject(rows3);
                } else {
                    stats['kegPourAmountsPerPerson'] = new Object();
                }
                db_io.getKegPourAmountsPerTime(function(rows4) {
                    if (rows4.length > 0) {
                        stats['kegPourAmountsPerTime'] = _generatePerTimeObject(rows4);
                    } else {
                        stats['kegPourAmountsPerTime'] = new Object();
                    }
                    web_io.updateStats(stats);
                });
            });
        });
    });
}

function _generatePerPersonObject(rows) {
    var result = new Object();
    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        result[row.name] = row.totalAmount;
    }
    return result;
}

function _generatePerTimeObject(rows) {
    var result = new Object();
    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        result[row.timePoured] = row.totalAmount;
    }
    return result;
}

function _checkPour(pour, callback) {
    callback();
}