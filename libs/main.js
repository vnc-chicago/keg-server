var web_io = require('./web.io.js'),
    db_io = require('./db.io.js'),
    keg_io = require('./keg.io.js'),
    keg,
    protocol = require('./protocol.js'),
    isDebug,
    device,
    sockets,
    logger,
    lastSeenUser,
    lastSeenUserTime,
    currentKeg,
    adminResponse;

exports.start = function(isDebugInstance, deviceInstance, socketsInstance, loggerInstance) {
    isDebug = isDebugInstance;
    device = deviceInstance;
    sockets = socketsInstance;
    logger = loggerInstance;

    // Setup our handlers
    db_io.start(_continueSetup, loggerInstance);
    web_io.start(socketsInstance, loggerInstance, db_io);


};

exports.createUser = function(req, res) {
    adminResponse = res;
    db_io.createUser(req.body.user, _createUserResponse);
};

function _createUserResponse(error) {
    if (adminResponse) {
        if (error) {
            adminResponse.redirect('/500');
        }
        adminResponse.redirect('/admin');
    }
    adminResponse = null;
}

exports.createKeg = function(req, res) {
    adminResponse = res;
    db_io.createKeg(req.body.keg, _setCurrentKegAfterAdmin);

};

function _setCurrentKegAfterAdmin(error) {
    if (error) {
        adminResponse.redirect('/500');
    } else {
        db_io.getCurrentKeg(_createKegResponse);
    }
}

function _createKegResponse(keg) {
    currentKeg = keg;
    web_io.updateKeg(currentKeg);
    if (adminResponse) {
        adminResponse.redirect('/admin');
    }
    adminResponse = null;
}

function _continueSetup(error) {
    if (error == null) {
        keg = new keg_io.Keg();
        keg.init(device, isDebug, logger);

        // Listen for events and route accordingly
        keg.addEventlistener(protocol.FLOW, _processFlow);
        keg.addEventlistener(protocol.POUR, _processPour);
        keg.addEventlistener(protocol.TAG, _processTag);
        keg.addEventlistener(protocol.TEMP, _processTemp);

        // Populate variables
        db_io.getCurrentKeg(_setCurrentKeg);
        db_io.getLastDrinker(function(user) {
            lastSeenUser = user;
            lastSeenUserTime = new Date();
            web_io.updateStats();
        });
    } else {
        logger.error(error);
        process.exit(1);
    }
}

function _setCurrentKeg(keg) {
    currentKeg = keg;
    web_io.updateKeg(currentKeg);
}

function _processFlow(data) {
    logger.debug('Main._processFlow : ' + data);

    if (data != 'END') {
        web_io.updateFlow(data);
    } else {
        web_io.updateFlow(0);
    }
}

function _processPour(data) {
    logger.debug('Main._processPour : ' + data);
    
    if (lastSeenUser != null && currentKeg != null && data != 0) {
        var pour = new Object();
        pour.kegId = currentKeg.id;
        pour.userId = lastSeenUser.id;
        pour.amount = data;
        db_io.createKegPour(pour, function() {
        });
        _checkPourForAchievements(data);
        db_io.getCurrentKeg(function(keg) {
            web_io.updateKeg(keg);
            if (isDebug && keg.amount <= 0) {
                var kegObject = new Object();
                kegObject.name = randomString();
                kegObject.description = randomString();
                kegObject.amount = 100;
                db_io.createKeg(kegObject, function() {
                });
            }
        });
        web_io.updateStats();
    }
}

function _checkPourForAchievements(amount) {
    var achievements = new Array();
    if (amount > 10) {
        // Das Boot
        db_io.recordAchievement(lastSeenUser.id, 1, function () {
        });
        achievements.push(1);
    } else if (amount < 2) {
        // Just Topping Off
        db_io.recordAchievement(lastSeenUser.id, 2, function () {
        });
        achievements.push(2);
    }

    if (new Date().getHours() < 12) {
        // Early Bird
        db_io.recordAchievement(lastSeenUser.id, 3, function () {
        });
        achievements.push(3);
    } else if (new Date().getHours() > 17) {
        // Night Owl
        db_io.recordAchievement(lastSeenUser.id, 4, function () {
        });
        achievements.push(4);
    }

    if (new Date().getDay() == 0 || new Date().getDay() == 6) {
        // Weekend Warrior
        db_io.recordAchievement(lastSeenUser.id, 5, function () {
        });
        achievements.push(5);
    }
}

function _pushAchievements(achievements) {
    for(var i = 0; i < achievements.length; i++) {

    }
}

function _processTag(data) {
    logger.debug('Main._processTag : ' + data);
    db_io.getUserByRFID(data, _processUserScan);
}

function _processUserScan(user) {
    if (user != undefined) {

        var difference = new Date().getTime() - lastSeenUserTime.getTime();
        logger.debug("Difference: " + difference);

        logger.debug("First: " + (lastSeenUser == undefined));

        if(lastSeenUser) {
            logger.debug("Second: " + (lastSeenUser.id != user.id));
        }
        logger.debug("Third: " + (difference > 30000));

        if(lastSeenUser == undefined || lastSeenUser.id != user.id || difference > 30000) {
            logger.info('User scanned : ' + user.name);
            keg.openValve();
            lastSeenUser = user;
            lastSeenUserTime = new Date();
            web_io.welcomeUser(user);
        }
    } else {
        web_io.denyUser();
    }
}

function _processTemp(data) {
    logger.debug('Main._processTemp : ' + data);

    if(currentKeg) {
        var status = new Object();
        status.kegId = currentKeg.id;
        status.temperature = data;
        db_io.createKegStatus(status, function() {
            web_io.updateTemperature(data);
        });
    }
}

function randomString() {
    var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
    var string_length = 8;
    var randomstring = '';
    for (var i = 0; i < string_length; i++) {
        var rnum = Math.floor(Math.random() * chars.length);
        randomstring += chars.substring(rnum, rnum + 1);
    }
    return randomstring;
}
