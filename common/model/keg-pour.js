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
                _db.run('INSERT INTO KegPours (userId, kegId, amount, poured) VALUES(?, ?, ?, strftime("%Y-%m-%d %H:00:00", "now", "localtime"))', [user.badgeId, keg.id, pour], function(error2) {
                    if (error2) {
                        _logger.error(error2);
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
                _db.get('SELECT userId, kegId, amount, poured FROM KegPours ORDER BY poured DESC', function(error2, row) {
                    if (error2) {
                        _logger.error(error2);
                    }
                    _db.close();
                    callback(row);
                })
            }
        });
    }

    function getPourAmountForUser(user, callback) {
    	var _db = new sqlite3.Database(Config.dbPath, function(error) {
           if (error) {
                _logger.error(error);
                _db.close();
                callback(undefined);
            } else {
                _db.get('SELECT sum(amount) as totalAmount FROM KegPours WHERE userId = ? GROUP BY userId ORDER BY poured DESC', [user.badgeId], function(error2, row) {
                    if (error2) {
                        _logger.error(error2);
                    }
                    _db.close();
                    callback(row);
                });
            }
        });
    }
    
    function isFirstPour(callback) {
    	var _db = new sqlite3.Database(Config.dbPath, function(error) {
            if (error) {
                _logger.error(error);
                _db.close();
                callback(false);
            } else {
            	var today = new Date();
                _db.get('SELECT poured FROM KegPours WHERE strftime("%Y", poured) = ? and strftime("%m", poured) = ? and strftime("%d", poured) = ?', [today.getFullYear(), today.getMonth(), today.getDate()], function(error2, row) {
                    if (error2) {
                        _logger.error(error2);
                    }
                    _db.close();
                    callback(typeof row === 'undefined');
                });
            }
        });
    }
    
    function _getNumberOfPoursForUserToday(user, callback) {
    	var _db = new sqlite3.Database(Config.dbPath, function(error) {
            if (error) {
                _logger.error(error);
                _db.close();
                callback(false);
            } else {
            	var today = new Date();
                _db.get('SELECT count(poured) as numPours FROM KegPours WHERE strftime("%Y-%m-%d", poured) = strftime("%Y-%m-%d", "now") and userId = ?', [user.badgeId], function(error2, row) {
                    if (error2) {
                        _logger.error(error2);
                    }
                    _db.close();
                    if(typeof row !== 'undefined') {
                    	callback(row.numPours);
                    } else {
                    	callback(Infinity);
                    }
                });
             }
           });
  };

    return {
        start : init,
        createPour : createNewPour,
        getLast : getLastPour,
        getAllTimePourAmountForUser : getPourAmountForUser,
        isFirstPour : isFirstPour,
        getNumberOfPoursForUserToday : _getNumberOfPoursForUserToday
    };
}());
module.exports = KegPour;
