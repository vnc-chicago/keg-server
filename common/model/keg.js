var sqlite3 = require('sqlite3');
var Config = require('../config');

var Keg = (function() {
    var _logger;

    function init(logger) {
        _logger = logger;
    }

    function getCurrentKeg(callback) {
        var _db = new sqlite3.Database(Config.dbPath, function(error) {
            if (error) {
                _logger.error(error);
                _db.close();
                callback(undefined);
            } else {
                _db.get('SELECT id, brewer, name, description, amount, loaded FROM Keg ORDER BY loaded DESC', function(error, row) {
                    if (error) {
                        _logger.error(error);
                    }
                    _db.close();
                    callback(row);
                });
            }
        });
    }

    return {
        start : init,
        currentKeg : getCurrentKeg
    }
}());
module.exports = Keg;