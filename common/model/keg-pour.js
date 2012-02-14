var sqlite3 = require('sqlite3');
var Config = require('../config');

var KegPour = (function() {
    var _logger;

    function init(logger) {
        _logger = logger;
    }

    function createNewPour(user, keg, pour, callback) {
        var _db = new sqlite3.Database(Config.dbPath, function(error) {
            if (error) {
                _logger.error(error);
                _db.close();
                callback(error);
            } else {
                _db.run('INSERT INTO KegPours (userId, kegId, amount, poured) VALUES(?, ?, ?, strftime("%Y-%m-%d %H:00:00", "now", "localtime"))', [user.badgeId, keg.id, pour], function(error) {
                    if (error) {
                        _logger.error(error);
                    }
                    _db.close();
                    callback(error);
                })
            }
        });
    }

    function getLastPour(callback) {
        var _db = new sqlite3.Database(Config.dbPath, function(error) {
            if (error) {
                _logger.error(error);
                _db.close();
                callback(undefined);
            } else {
                _db.get('SELECT userId, kegId, amount, poured FROM KegPours ORDER BY poured DESC', function(error, row) {
                    if (error) {
                        _logger.error(error);
                    }
                    _db.close();
                    callback(row);
                })
            }
        });
    }

    return {
        start : init,
        createPour : createNewPour,
        getLast : getLastPour
    }
}());
module.exports = KegPour;