var Config = require('../common/config');
var Camera = require('../common/camera');
var WebIO = require('./web-io');
var KegIO = require('./keg-io');
var protocol = require('../common/protocol');
var User = require('../common/model/user');
var Keg = require('../common/model/keg');
var KegPour = require('../common/model/keg-pour');
var Stats = require('../common/model/stats');

var Main = (function () {
    var _logger;
    var _currentKeg;
    var _currentUser;
    var _lastUser;
    var _isUserCreation;
    var _firstName;
    var _lastName;
    var _affiliation;
    var _currentKegLoaded = false;
    var _lastUserLoaded = false;

    function init(app, logger) {
        _logger = logger;
        _isUserCreation = false;

        setTimeout(function() {
            WebIO.start(app, logger);

            KegIO.start(logger);
            KegIO.getEmitter().on(protocol.TAG, handleTag);
            KegIO.getEmitter().on(protocol.FLOW, handleFlow);
            KegIO.getEmitter().on(protocol.POUR, handlePour);
            KegIO.getEmitter().on(protocol.TEMP, handleTemp);

            User.start(logger);

            KegPour.start(logger);
            KegPour.getLast(function(pour) {
                if (typeof pour !== 'undefined' && pour.hasOwnProperty('userId')) {
                    User.byTag(pour.userId, function(user) {
                        if (typeof user !== 'undefined') {
                            _logger.debug('Last User: ' + user.firstName + ' ' + user.lastName);
                            _lastUser = user;
                        }
                        _lastUserLoaded = true;
                        initStats();
                    });
                } else {
                    _lastUserLoaded = true;
                    initStats();
                }
            });

            Keg.start(logger);
            Keg.currentKeg(function(keg) {
                _currentKeg = keg;
                _currentKegLoaded = true;
                initStats();
            });

            Stats.start(logger);
            compileAndPushStats();
        }, 5000);
    }

    function initStats() {
        if(_currentKegLoaded && _lastUserLoaded) {
            var stats = {
                lastUser : _lastUser,
                currentKeg : _currentKeg
            };
            WebIO.pushInitialData(stats);
        }
    }

    function setIsUserCreation(value) {
        _isUserCreation = value;
    }

    function getIsUserCreation() {
        return _isUserCreation;
    }

    function handleTag(tag) {
        if (!_isUserCreation) {
            // Get user
            User.byTag(tag, function(user) {
                // If user exists
                if (typeof user !== 'undefined') {
                    _logger.debug('Scanned User : ' + user.firstName + ' ' + user.lastName);

                    var now = new Date().getTime();
                    var lastUserValid = typeof _lastUser !== 'undefined';
                    var lastUserIsCurrentUser = false;
                    var diff = Config.scanTimeout + 1;
                    if (lastUserValid) {
                        lastUserIsCurrentUser = _lastUser.badgeId == user.badgeId;
                        diff = now - _lastUser.timeStamp;
                    }

                    if ((lastUserValid && lastUserIsCurrentUser && diff > Config.scanTimeout) || typeof _lastUser === 'undefined' || !lastUserIsCurrentUser) {
                        // Store in _currentUser
                        _lastUser = _currentUser;
                        if (typeof _lastUser !== 'undefined') {
                            _lastUser.timeStamp = now;
                        }
                        _currentUser = user;
                        // Open valve
                        KegIO.openValve();
                        // Welcome user
                        WebIO.welcomeUser(user);
                    }
                } else {
                    // Deny user
                    WebIO.denyUser();
                }
            });
        } else {
            // See if tag exists
            User.byTag(tag, function(user) {
                if (typeof user === 'undefined') {
                    var userObject = {
                        firstName : _firstName,
                        lastName : _lastName,
                        affiliation : _affiliation,
                        badgeId : tag
                    };
                    _firstName = '';
                    _lastName = '';
                    _affiliation = '';
                    if (Config.hasCamera) {
                        WebIO.promptForPic();
                        takePicture(userObject);
                    } else {
                        createUser(userObject, false);
                    }
                } else {
                    WebIO.createUserFail('Badge is already assigned to someone');
                }
            });
        }
    }

    function handleFlow(flow) {
        if (flow === 'END') {
            flow = 0;
        }
        // Push data to web
        WebIO.updateFlow(flow);
    }

    function handlePour(pour) {
        if (typeof _currentUser != 'undefined') {
            // Update current user number pours
            User.incrementPour(_currentUser, function() {
                // Update KegPour with new pour
                KegPour.createPour(_currentUser, _currentKeg, pour, function() {
                    // Update Keg with new amount
                    Keg.updateAmount(pour, function() {
                        Keg.currentKeg(function(keg) {
                            _currentKeg = keg;
                            compileAndPushStats();
                        });
                    });
                });
            });
        }
        // Push new stats to web
    }

    function handleTemp(temp) {
        // Push temp to web
        WebIO.updateTemp(temp);
    }

    function _promptUser(user) {
        _firstName = user.firstName;
        _lastName = user.lastName;
        _affiliation = user.affiliation;
        WebIO.promptForCard();
    }

    function takePicture(user) {
        setTimeout(function() {
            logger.debug("Take Picture: " + user.name);
            var cam = new Camera();
            cam.snap(user.badgeId);
            cam.on('done', function() {
                createUser(user, true);
            })
        }, 3000);
    }

    function createUser(user, hasPicture) {
        // Ensure user information is there
        if (user.hasOwnProperty('badgeId') && user.badgeId != '' &&
            user.hasOwnProperty('firstName') && user.firstName != '' &&
            user.hasOwnProperty('lastName') && user.lastName != '' &&
            user.hasOwnProperty('affiliation') && user.affiliation != '') {

            // Store user information
            User.save(user, function(error) {
                if (typeof error !== 'undefined') {
                    if (hasPicture) {
                        // Push picture to web
                        WebIO.sendPicture(user.badgeId, function(error2) {
                            if (!error2) {
                                WebIO.createUserSuccess();
                            } else {
                                _logger.error(error2);
                                WebIO.createUserFail(error2);
                            }
                        });
                    } else {
                        WebIO.createUserSuccess();
                    }
                } else {
                    _logger.error(error);
                    WebIO.createUserFail(error);
                }
            });
        }
    }

    function _createKeg(keg) {
        // Store keg details
        Keg.createNew(keg, function(error) {
            if(!error) {
                // Push keg details to web
                WebIO.updateKeg(keg);
            }
        });
    }

    function compileAndPushStats() {
        if (typeof _currentKeg !== 'undefined') {
            WebIO.updateKeg(_currentKeg);
        }

        // Get stats
        var stats = new Object();
        Stats.allTimePourAmountPerPerson(function(rows) {
            stats['allTimePourAmountsPerPerson'] = Stats.transformPersonRow(rows);
            Stats.allTimePourAmountPerTime(function(rows2) {
                stats['allTimePourAmountsPerTime'] = Stats.transformTimeRow(rows2);
                Stats.currentKegPourAmountPerPerson(function(rows3) {
                    stats['kegPourAmountsPerPerson'] = Stats.transformPersonRow(rows3);
                    Stats.currentKegPourAmountPerTime(function(rows4) {
                        stats['kegPourAmountsPerTime'] = Stats.transformTimeRow(rows4);

                        // Push stats to web
                        WebIO.updateStats(stats);
                    })
                })
            })
        });
    }

    return {
        setIsUserCreation : setIsUserCreation,
        getIsUserCreation : getIsUserCreation,
        start : init,
        promptUser : _promptUser,
        createKeg : _createKeg
    }
}());
module.exports = Main;
