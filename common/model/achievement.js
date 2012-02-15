var Achievement = (function() {
    var _logger;

    function init(logger) {
        _logger = logger;
    }

    function isFirstPour(user) {
        // Checks in for first time
    }

    function isDecaUser(user) {
        // Checks in 10 times
    }

    function isHalfCenturion(user) {
        // Checks in 50 times
    }

    function isCenturion(user) {
        // Checks in 100 times
    }

    function isSixShooter(user) {
        // Drinks 72oz all time
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
    }

    function isInForLongHaul() {
        // Checks in after 6pm
    }

    function isPartyStarter() {
        // First in day
    }

    function isTrifecta(user) {
        // Checks in 3 times in day
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
    }

    function isChilly(kegTemp) {
        // KegTemp is less than 38 degrees
    }

    function isWarmAndFuzzy(kegTemp) {
        // KegTemp is greater than 40 degress
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