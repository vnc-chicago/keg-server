var Config = require('../common/config');
var WebIO = require('./web-io');
var KegIO = require('./keg-io');
var protocol = require('../common/protocol');
var User = require('../common/model/user');
var Keg = require('../common/model/keg');
var KegPour = require('../common/model/keg-pour');

var Main = (function () {
    var _logger;
    var _currentKeg;
    var _currentUser;
    var _lastUser;

    function init(app, logger) {
        _logger = logger;

        setTimeout(function() {
            WebIO.start(app, logger);
            WebIO.getEmitter().on('createUser', createUser);
            WebIO.getEmitter().on('createKeg', createKeg);

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
                        if(typeof user !== 'undefined') {
                            _logger.debug('Last User: ' + user.firstName + ' ' + user.lastName);
                            _lastUser = user;
                        }
                    });
                }
            });

            Keg.start(logger);
            Keg.currentKeg(function(keg) {
                _currentKeg = keg;
            });
        }, 5000);
    }

    function handleTag(tag) {
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
    }

    function handleFlow(flow) {
        // Push data to web
        WebIO.updateFlow(flow);
    }

    function handlePour(pour) {
        if (typeof _currentUser != 'undefined') {
            // Update current user number pours
            User.incrementPour(_currentUser, function() {
            });
            // Update KegPour with new pour
            KegPour.createPour(_currentUser, _currentKeg, pour, function() {
            });
        }
        // Push new stats to web
        compileAndPushStats();
    }

    function handleTemp(temp) {
        // Push temp to web
        WebIO.updateTemp(temp);
    }

    function createUser() {
        // Get badge
        // If user exists with same badge
        // Deny creation
        // Else
        // Prompt for picture
        // Wait 5 seconds
        // Take picture
        // Store user information
        // Push picture to web
    }

    function createKeg(keg) {
        // Store keg details

        // Push keg details to web
        WebIO.updateKeg(keg);
    }

    function compileAndPushStats() {
        // Get stats
        // Push stats to web
    }

    return {
        start : init
    }
}());
module.exports = Main;
