var KegPours = require('./keg-pour');
var sqlite3 = require('sqlite3');
var Config = require('../config');

var Achievement = (function() {
    var _logger;
    var _isFirstPourSet = false;
    var _isDecaUserSet = false;
    var _isHalfCenturionSet = false;
    var _isCenturionSet = false;
    var _sixShooterSet = false;
    var _doubleSixShooterSet = false;
    var _dirtyThirtySet = false;
    var _ponyRiderSet = false;
    var _halfKeggerSet = false;
    var _trifectaSet = false;
    var _goingLongSet = false;
    var _beautifulSet = false;
    var _firstSet = false;
    var _isEarlyBirdSet = false;
    var _isInForLongHaulSet = false;
    var _shouldGoHomeSet = false;
    var _result;
    var _callback;

    function init(logger) {
        _logger = logger;
    }

    function rollThroughAchievements(user, callback) {
        _result = {};
        _callback = callback;

        checkNumPourStats(user);
        checkTimeDateStats();
        checkPourAmountStats(user);
        checkDailyStats(user);
    }

    function handleDBCallbacks(result) {
        _result = mergeResults(_result, result);

        if (_isFirstPourSet && _isDecaUserSet && _isHalfCenturionSet && _isCenturionSet && _sixShooterSet && _doubleSixShooterSet && _dirtyThirtySet && _ponyRiderSet && _halfKeggerSet && _trifectaSet && _goingLongSet && _beautifulSet && _firstSet && _isEarlyBirdSet && _isInForLongHaulSet && _shouldGoHomeSet) {
            _isFirstPourSet = false;
            _isDecaUserSet = false;
            _isHalfCenturionSet = false;
            _isCenturionSet = false;
            _sixShooterSet = false;
            _doubleSixShooterSet = false;
            _dirtyThirtySet = false;
            _ponyRiderSet = false;
            _halfKeggerSet = false;
            _trifectaSet = false;
            _goingLongSet = false;
            _beautifulSet = false;
            _firstSet = false;
            _isEarlyBirdSet = false;
            _isInForLongHaulSet = false;
            _shouldGoHomeSet = false;
            _callback(_result);
        }
    }

    function checkNumPourStats(user) {
        isFirstPour(user, handleDBCallbacks);
        isDecaUser(user, handleDBCallbacks);
        isHalfCenturion(user, handleDBCallbacks);
        isCenturion(user, handleDBCallbacks);
    }

    function checkPourAmountStats(user) {
        isSixShooter(user, handleDBCallbacks);
        isDoubleSixShooter(user, handleDBCallbacks);
        isDirtyThirty(user, handleDBCallbacks);
        isPonyRider(user, handleDBCallbacks);
        isHalfKegger(user, handleDBCallbacks);
    }

    function checkTimeDateStats() {
        isEarlyBird(handleDBCallbacks);
        isInForLongHaul(handleDBCallbacks);
        shouldGoHome(handleDBCallbacks);
    }

    function checkDailyStats(user) {
        isPartyStarter(handleDBCallbacks);
        isTrifecta(user, handleDBCallbacks);
        isGoingLong(user, handleDBCallbacks);
        isBeautiful(user, handleDBCallbacks)
    }

    function getById(id, callback) {
        var _db = new sqlite3.Database(Config.dbPath, function(error) {
            if (error) {
                _logger.error(error);
                _db.close();
            } else {
                _db.get("select name, description, path from Achievement where id=?", [id], function(error, row) {
                    if (error) {
                        _logger.error(error);
                    }
                    callback(row);
                })
            }
        });
    }

    function isFirstPour(user, callback) {
        // Checks in for first time
        getById(Achievement.isFirstPour, function(achievement) {
            if (typeof achievement !== 'undefined') {
                var obj = {
                    isFirstPour: {
                        awarded: (user.totalPours == 1),
                        name: achievement.name,
                        description: achievement.description,
                        path: achievement.path
                    }
                };
                _isFirstPourSet = true;
                callback(obj);
            }
        });
    }

    function isDecaUser(user, callback) {
        // Checks in 10 times
        getById(Achievement.isDecaUser, function(achievement) {
            if (typeof achievement !== 'undefined') {
                var obj = {
                    isDecaUser: {
                        awarded: (user.totalPours == 10),
                        name: achievement.name,
                        description: achievement.description,
                        path: achievement.path
                    }
                };
                _isDecaUserSet = true;
                callback(obj);
            }
        });
    }

    function isHalfCenturion(user, callback) {
        // Checks in 50 times
        getById(Achievement.isHalfCenturion, function(achievement) {
            if (typeof achievement !== 'undefined') {
                var obj = {
                    isHalfCenturion: {
                        awarded: (user.totalPours == 50),
                        name: achievement.name,
                        description: achievement.description,
                        path: achievement.path
                    }
                };
                _isHalfCenturionSet = true;
                callback(obj);
            }
        });
    }

    function isCenturion(user, callback) {
        // Checks in 100 times
        getById(Achievement.isCenturion, function(achievement) {
            if (typeof achievement !== 'undefined') {
                var obj = {
                    isCenturion: {
                        awarded: (user.totalPours == 100),
                        name: achievement.name,
                        description: achievement.description,
                        path: achievement.path
                    }
                };
                _isCenturionSet = true;
                callback(obj);
            }
        });
    }

    function isSixShooter(user, callback) {
        // Drinks 72oz all time
        KegPours.getAllTimePourAmountForUser(user, function(totalAmount) {
            getById(Achievement.isSixShooter, function(achievement) {
                var obj = {
                    isSixShooter: {
                        awarded: (totalAmount >= 72),
                        name: achievement.name,
                        description: achievement.description,
                        path: achievement.path
                    }
                };
                _sixShooterSet = true;
                callback(obj);
            });
        });
    }

    function isDoubleSixShooter(user, callback) {
        // drinks 144oz all time
        KegPours.getAllTimePourAmountForUser(user, function(totalAmount) {
            getById(Achievement.isDoubleSixShooter, function(achievement) {
                var obj = {
                    isDoubleSixShooter: {
                        awarded: (totalAmount >= 144),
                        name: achievement.name,
                        description: achievement.description,
                        path: achievement.path
                    }
                };
                _doubleSixShooterSet = true;
                callback(obj);
            });
        });
    }

    function isDirtyThirty(user, callback) {
        // Drinks 360oz all time
        KegPours.getAllTimePourAmountForUser(user, function(totalAmount) {
            getById(Achievement.isDirtyThirty, function(achievement) {
                var obj = {
                    isDirtyThirty: {
                        awarded: (totalAmount >= 360),
                        name: achievement.name,
                        description: achievement.description,
                        path: achievement.path
                    }
                };
                _dirtyThirtySet = true;
                callback(obj);
            });
        });
    }

    function isPonyRider(user, callback) {
        // Drinks 980oz all time
        KegPours.getAllTimePourAmountForUser(user, function(totalAmount) {
            getById(Achievement.isPonyRider, function(achievement) {
                var obj = {
                    isPonyRider: {
                        awarded: (totalAmount >= 980),
                        name: achievement.name,
                        description: achievement.description,
                        path: achievement.path
                    }
                };
                _ponyRiderSet = true;
                callback(obj);
            });
        });
    }

    function isHalfKegger(user, callback) {
        // Drinks 1980oz all time
        KegPours.getAllTimePourAmountForUser(user, function(totalAmount) {
            getById(Achievement.isHalfKegger, function(achievement) {
                var obj = {
                    isHalfKegger: {
                        awarded: (totalAmount >= 1980),
                        name: achievement.name,
                        description: achievement.description,
                        path: achievement.path
                    }
                };
                _halfKeggerSet = true;
                callback(obj);
            });
        });
    }

    function isEarlyBird(callback) {
        // Checks in before 2pm
        getById(Achievement.isEarlyBird, function(achievement) {
            var now = new Date();
            var obj = {
                isEarlyBird: {
                    awarded: (now.getHours() <= 14),
                    name: achievement.name,
                    description: achievement.description,
                    path: achievement.path
                }
            };
            _isEarlyBirdSet = true;
            callback(obj);
        });
    }

    function isInForLongHaul(callback) {
        // Checks in after 6pm
        getById(Achievement.isInForLongHaul, function(achievement) {
            var now = new Date();
            var obj = {
                isInForLongHaul: {
                    awarded: (now.getHours() >= 18),
                    name: achievement.name,
                    description: achievement.description,
                    path: achievement.path
                }
            };
            _isInForLongHaulSet = true;
            callback(obj);
        });
    }

    function isPartyStarter(callback) {
        // First in day
        KegPours.isFirstPour(function(isFirst) {
            getById(Achievement.isPartyStarter, function(achievement) {
                var obj = {
                    isPartyStarter: {
                        awarded: (isFirst),
                        name: achievement.name,
                        description: achievement.description,
                        path: achievement.path
                    }
                };
                _firstSet = true;
                callback(obj);
            });
        });
    }

    function isTrifecta(user, callback) {
        // Checks in 3 times in day
        KegPours.getNumberOfPoursForUserToday(user, function(numPours) {
            getById(Achievement.isTrifecta, function(achievement) {
                var obj = {
                    isTrifecta: {
                        awarded: (numPours == 3),
                        name: achievement.name,
                        description: achievement.description,
                        path: achievement.path
                    }
                };
                _trifectaSet = true;
                callback(obj);
            });
        });
    }

    function isGoingLong(user, callback) {
        // Checks in 5 times in day
        KegPours.getNumberOfPoursForUserToday(user, function(numPours) {
            getById(Achievement.isGoingLong, function(achievement) {
                var obj = {
                    isGoingLong: {
                        awarded: (numPours == 5),
                        name: achievement.name,
                        description: achievement.description,
                        path: achievement.path
                    }
                };
                _goingLongSet = true;
                callback(obj);
            });
        });
    }

    function isBeautiful(user, callback) {
        // Checks in 7 times in day
        KegPours.getNumberOfPoursForUserToday(user, function(numPours) {
            getById(Achievement.isBeautiful, function(achievement) {
                var obj = {
                    isBeautiful: {
                        awarded: (numPours == 7),
                        name: achievement.name,
                        description: achievement.description,
                        path: achievement.path
                    }
                };
                _beautifulSet = true;
                callback(obj);
            });
        });
    }

    function isHavingRoughWeek(user) {
        // Checks in 2 consecutive days
    }

    function isOnThreeStepProgram(user) {
        // Checks in 3 consecutive days
    }

    function shouldGoHome(callback) {
        // Checks in on weekend
        getById(Achievement.shouldGoHome, function(achievement) {
            var today = new Date();
            var obj = {
                shouldGoHome: {
                    awarded: (today.getDay() == 0 || today.getDay() == 6),
                    name: achievement.name,
                    description: achievement.description,
                    path: achievement.path
                }
            };
            _shouldGoHomeSet = true;
            callback(obj);
        });
    }

    function isChilly(kegTemp) {
        // KegTemp is less than 38 degrees
        return kegTemp < 38;
    }

    function isWarmAndFuzzy(kegTemp) {
        // KegTemp is greater than 40 degrees
        return kegTemp > 40;
    }

    function isDrinkingBuddy() {
        // User checks in within 20sec of someone else
    }

    function isChugger(user) {
        // Check in twice in 15 minutes
    }

    function mergeResults(result, addition) {
        for (var prop in addition) {
            if (!result.hasOwnProperty(prop)) {
                result[prop] = addition[prop];
            } else {
                _logger.error('Two achievements have same property: ' + prop);
            }
        }

        return result;
    }

    return {
        start : init,
        getAchievementsEarned: rollThroughAchievements,

        isDoubleSixShooter: 1,
        shouldGoHome: 2,
        isHalfKegger: 3,
        isHalfCenturion: 4,
        isCenturion: 5,
        isDecaUser: 6,
        isPonyRider: 7,
        isSixShooter: 8,
        isFirstPour: 9,
        isInForLongHaul: 10,
        isTrifecta: 11,
        isEarlyBird: 12,
        isPartyStarter: 13,
        isGoingLong: 14,
        isDirtyThirty: 15,
        isBeautiful: 16


    }
}());
module.exports = Achievement;
