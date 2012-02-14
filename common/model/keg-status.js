var KegStatus = (function() {
    var _logger;

    function init(logger) {
        _logger = logger;
    }

    return {
        start : init
    }
}());
module.exports = KegStatus;