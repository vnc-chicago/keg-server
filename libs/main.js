var web_io = require('./web.io.js'),
    db_io = require('./db.io.js'),
    keg_io = require('./keg.io.js'),
    keg = null,
    protocol = require('./protocol.js'),
    admin = require('../routes/admin.js'),
    isDebug = true,
    device = null,
    sockets = null,
    logger = null,
    lastSeenUser = null,
    currentKeg = null,
    adminResponse = null;

exports.start = function(isDebug, device, socketsInstance, loggerInstance) {
    this.isDebug = isDebug;
    this.device = device;
    sockets = socketsInstance;
    logger = loggerInstance;

    // Setup our handlers
    web_io.start(socketsInstance, loggerInstance, this);
    db_io.start(_continueSetup, loggerInstance);


};

exports.createUser = function(req, res) {
    adminResponse = res;
    db_io.createUser(req.body.user, _createUserResponse);
};

function _createUserResponse(error) {
    if(adminResponse) {
        if(error) {
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
    if(error) {
        adminResponse.redirect('/500');
    } else {
        db_io.getCurrentKeg(_createKegResponse);
    }
}

function _createKegResponse(keg) {
    currentKeg = keg;
    web_io.updateKeg(currentKeg);
    if(adminResponse) {
        adminResponse.redirect('/admin');
    }
    adminResponse = null;
}

function _continueSetup(error) {
    if (error == null) {
        keg = new keg_io.Keg();
        keg.init(device, isDebug, logger);

        // Listen for events and route accordingly
        keg.on(protocol.FLOW, _processFlow);
        keg.on(protocol.POUR, _processPour);
        keg.on(protocol.TAG, _processTag);
        keg.on(protocol.TEMP, _processTemp);

        // Populate variables
        db_io.getCurrentKeg(_setCurrentKeg);
        db_io.getLastDrinker(_processUserScan);
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
    if (this.isDebug) {
        logger.debug('Main._processFlow : ' + data);
    }

    if(data != 'END') {
        web_io.updateFlow(data);
    } else {
        web_io.updateFlow(0);
    }
}

function _processPour(data) {
    if (this.isDebug) {
        logger.debug('Main._processPour : ' + data);
    }
    if (lastSeenUser != null && currentKeg != null) {
        var pour = new Object();
        pour.kegId = currentKeg.id;
        pour.userId = lastSeenUser.id;
        pour.amount = data;
        db_io.createKegPour(pour, function() { });
        _checkPourForAchievements(data);
        db_io.getCurrentKeg(function(keg) {
            web_io.updateKeg(keg);
            if(isDebug && keg.amount <= 0) {
                    var keg = new Object();
                    keg.name = randomString();
                    keg.description = randomString();
                    keg.amount = 100;
                    db_io.createKeg(keg, function() {});
            }
        });
    }
}

function _checkPourForAchievements(amount) {
    if(amount > 10) {
        // Das Boot
    } else if(amount < 2) {
        // Just Topping Off
    }

    if(new Date().getHours() < 6) {
        // Early Bird
    } else if(new Date().getHours() > 11) {
        // Night Owl
    }

    if(new Date().getDay() == 0 || new Date().getDay() == 6) {
        // Weekend Warrior
    }
}

function _processTag(data) {
    if (this.isDebug) {
        logger.debug('Main._processTag : ' + data);
    }
    db_io.getUserByRFID(data, _processUserScan);
}

function _processUserScan(user) {
    if (user != undefined) {
        if (this.isDebug) {
            logger.debug('User scanned : ' + user.toString());
            keg.openValve();
        }
        lastSeenUser = user;
        web_io.welcomeUser(user);
    } else {
        web_io.denyUser();
    }
}

function _processTemp(data) {
    if (this.isDebug) {
        logger.debug('Main._processTemp : ' + data);
    }
    var status = new Object();
    status.kegId = currentKeg.id;
    status.temperature = data;
    db_io.createKegStatus(status, function() {
        web_io.updateTemperature(data);
    });
}

function randomString() {
	var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
	var string_length = 8;
	var randomstring = '';
	for (var i=0; i<string_length; i++) {
		var rnum = Math.floor(Math.random() * chars.length);
		randomstring += chars.substring(rnum,rnum+1);
	}
    return randomstring;
}