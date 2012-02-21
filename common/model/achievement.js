var KegPours = require('./keg-pour');

var Achievement = (function() {
    var _logger;
    var _sixShooterSet;
    var _doubleSixShooterSet;
    var _dirtyThirtySet;
    var _ponyRiderSet;
    var _halfKeggerSet;
    var _trifectaSet;
    var _goingLongSet;
    var _beautifulSet;
    var _firstSet;
    var _result;
    var _callback;

    function init(logger) {
        _logger = logger;
    }

    function rollThroughAchievements(user, callback) {
        _result = {};
        _callback = callback;

        var numPourStats = checkNumPourStats(user);
        _result = mergeResults(_result, numPourStats);

        var timeDateStats = checkTimeDateStats();
        _result = mergeResults(_result, timeDateStats);

        checkPourAmountStats(user);
        checkDailyStats(user);
    }

    function handleDBCallbacks(result) {
        _result = mergeResults(_result, result);

        if (_sixShooterSet && _doubleSixShooterSet && _dirtyThirtySet && _ponyRiderSet && _halfKeggerSet && _trifectaSet && _goingLongSet && _beautifulSet && _firstSet) {
            _sixShooterSet = false;
            _doubleSixShooterSet = false;
            _dirtyThirtySet = false;
            _ponyRiderSet = false;
            _halfKeggerSet = false;
            _trifectaSet = false;
            _goingLongSet = false;
            _beautifulSet = false;
            _firstSet = false;
            _callback(_result);
        }
    }

    function checkNumPourStats(user) {
        return {
            isFirstPour: isFirstPour(user),
            isDecaUser: isDecaUser(user),
            isHalfCenturion: isHalfCenturion(user),
            isCenturion: isCenturion(user)
        };
    }

    function checkPourAmountStats(user) {
        isSixShooter(user, handleDBCallbacks);
        isDoubleSixShooter(user, handleDBCallbacks);
        isDirtyThirty(user, handleDBCallbacks);
        isPonyRider(user, handleDBCallbacks);
        isHalfKegger(user, handleDBCallbacks);
    }

    function checkTimeDateStats() {
        return {
            isEarlyBird: isEarlyBird(),
            isInForLongHaul: isInForLongHaul(),
            shouldGoHome:shouldGoHome()
        }
    }

    function checkDailyStats(user) {
        isPartyStarter(handleDBCallbacks);
        isTrifecta(user, handleDBCallbacks);
        isGoingLong(user, handleDBCallbacks);
        isBeautiful(user, handleDBCallbacks)
    }

    function isFirstPour(user) {
        // Checks in for first time
        return user.totalPours == 1;
    }

    function isDecaUser(user) {
        // Checks in 10 times
        return user.totalPours == 10;
    }

    function isHalfCenturion(user) {
        // Checks in 50 times
        return user.totalPours == 50;
    }

    function isCenturion(user) {
        // Checks in 100 times
        return user.totalPours == 100;
    }

    function isSixShooter(user, callback) {
        // Drinks 72oz all time
        KegPours.getAllTimePourAmountForUser(user, function(totalAmount) {
            _sixShooterSet = true;
            callback({isSixShooter: (totalAmount > 72)});
        });
    }

    function isDoubleSixShooter(user, callback) {
        // drinks 144oz all time
        KegPours.getAllTimePourAmountForUser(user, function(totalAmount) {
            _doubleSixShooterSet = true;
            callback({isDoubleSixShooter: (totalAmount > 144)});
        });
    }

    function isDirtyThirty(user, callback) {
        // Drinks 360oz all time
        KegPours.getAllTimePourAmountForUser(user, function(totalAmount) {
            _dirtyThirtySet = true;
            callback({isDirtyThirty: (totalAmount > 360)});
        });
    }

    function isPonyRider(user, callback) {
        // Drinks 980oz all time
        KegPours.getAllTimePourAmountForUser(user, function(totalAmount) {
            _ponyRiderSet = true;
            callback({isPonyRider: (totalAmount > 980)});
        });
    }

    function isHalfKegger(user, callback) {
        // Drinks 1980oz all time
        KegPours.getAllTimePourAmountForUser(user, function(totalAmount) {
            _halfKeggerSet = true;
            callback({isHalfKegger: (totalAmount > 1980)});
        });
    }

    function isEarlyBird() {
        // Checks in before 2pm
        var now = new Date();
        return now.getHours() <= 14;
    }

    function isInForLongHaul() {
        // Checks in after 6pm
        var now = new Date();
        return now.getHours() >= 18;
    }

    function isPartyStarter(callback) {
        // First in day
        KegPours.isFirstPour(function(isFirst) {
            _firstSet = true;
            callback({isPartyStarter: isFirst});
        });
    }

    function isTrifecta(user, callback) {
        // Checks in 3 times in day
        KegPours.getNumberOfPoursForUserToday(user, function(numPours) {
            _trifectaSet = true;
            callback({isTrifecta: (numPours > 3)});
        });
    }

    function isGoingLong(user, callback) {
        // Checks in 5 times in day
        KegPours.getNumberOfPoursForUserToday(user, function(numPours) {
            _goingLongSet = true;
            callback({isGoingLong: (numPours > 5)});
        });
    }

    function isBeautiful(user, callback) {
        // Checks in 7 times in day
        KegPours.getNumberOfPoursForUserToday(user, function(numPours) {
            _beautifulSet = true;
            callback({isBeautiful: (numPours > 7)});
        });
    }

    function isHavingRoughWeek(user) {
        // Checks in 2 consecutive days
    }

    function isOnThreeStepProgram(user) {
        // Checks in 3 consecutive days
    }

    function shouldGoHome() {
        // Checks in on weekend
        var today = new Date();
        return today.getDay() == 0 || today.getDay() == 6;
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
