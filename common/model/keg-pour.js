var sqlite3 = require('sqlite3');
var Config = require('../config');
var winston = require('winston');

var KegPour = (function() {

    function init() {
    }

    function createNewPour(user, keg, pour, callback) {
        var _db = new sqlite3.Database(Config.dbPath, function(error) {
            if (error) {
                winston.error(error);
                _db.close();
                callback(error);
            } else {
                _db.run('INSERT INTO KegPours (userId, kegId, amount) VALUES(?, ?, ?)', [user.badgeId, keg.id, pour], function(error2) {
                    if (error2) {
                        winston.error(error2);
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
                winston.error(error);
                _db.close();
                callback(undefined);
            } else {
                _db.get('SELECT userId, kegId, amount, poured FROM KegPours ORDER BY poured DESC', function(error2, row) {
                    if (error2) {
                        winston.error(error2);
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
                winston.error(error);
                _db.close();
                callback(undefined);
            } else {
                _db.get('SELECT sum(amount) as totalAmount FROM KegPours WHERE userId = ? GROUP BY userId ORDER BY poured DESC', [user.badgeId], function(error2, row) {
                    if (error2) {
                        winston.error(error2);
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
                winston.error(error);
                _db.close();
                callback(false);
            } else {
                _db.all('SELECT poured FROM KegPours WHERE strftime("%Y-%m-%d", poured) = strftime("%Y-%m-%d", "now")', function(error2, rows) {
                    if (error2) {
                        winston.error(error2);
                    }
                    _db.close();
                    callback(rows.length === 1);
                });
            }
        });
    }
    
    function _getNumberOfPoursForUserToday(user, callback) {
    	var _db = new sqlite3.Database(Config.dbPath, function(error) {
            if (error) {
                winston.error(error);
                _db.close();
                callback(false);
            } else {
            	var today = new Date();
                _db.get('SELECT count(poured) as numPours FROM KegPours WHERE strftime("%Y-%m-%d", poured) = strftime("%Y-%m-%d", "now") and userId = ?', [user.badgeId], function(error2, row) {
                    if (error2) {
                        winston.error(error2);
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
