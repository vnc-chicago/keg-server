var Achievement = (function() {
    var _logger;

    function init(logger) {
        _logger = logger;
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
        KegPours.getAllTimePourAmountForUser(user, callback);
    }

    function isDoubleSixShooter(user) {
        // Drinks 144oz all time
    }

    function isDirtyThirty(user) {
        // Drinks 360oz all time
    }

    function isPonyRider(user) {
        // Drinks 980oz all time
    }

    function isHalfKegger(user) {
        // Drinks 1980oz all time
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

    function isPartyStarter() {
        // First in day
        KegPours.determineIfFirstPour;
    }

    function isTrifecta(user) {
        // Checks in 3 times in day
        KegPours.getNumberOfPoursForUserToday;
    }

    function isGoingLong(user) {
        // Checks in 5 times in day
    }

    function isBeautiful(user) {
        // Checks in 7 times in day
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
        // KegTemp is greater than 40 degress
        return kegTemp > 40;
    }

    function isDrinkingBuddy() {
        // User checks in within 20sec of someone else
    }

    function isChugger(user) {
        // Check in twice in 15 minutes
    }

    return {
        start : init
    }
}());
module.exports = Achievement;
