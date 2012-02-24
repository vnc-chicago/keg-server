var Config = require('../config');
var sqlite3 = require('sqlite3');

var Stats = (function() {
    var _logger;

    function init(logger) {
        _logger = logger;
    }

    function getAllTimePerPerson(callback) {
        var _db = new sqlite3.Database(Config.dbPath, function(error) {
            if (error) {
                _logger.error(error);
                _db.close();
                callback(undefined);
            } else {
                _db.all('select (u.firstName || " " || u.lastName) as name, count(p.amount) as pours, sum(p.amount) as totalAmount from User u, KegPours p where u.badgeId = p.userId group by u.badgeId order by totalAmount desc', function(error2, rows) {
                    if (error2) {
                        _logger.error(error2);
                    }
                    _db.close();
                    callback(rows);
                });
            }
        });
    }

    function getAllTimePerTime(callback) {
        var _db = new sqlite3.Database(Config.dbPath, function(error) {
            if (error) {
                _logger.error(error);
                _db.close();
                callback(undefined);
            } else {
                _db.all('select strftime("%H", poured, "localtime") as timePoured, count(amount) as pours, sum(amount) as totalAmount from KegPours group by timePoured order by timePoured', function(error2, rows) {
                    if (error2) {
                        _logger.error(error2);
                    }
                    _db.close();
                    callback(rows);
                });
            }
        });
    }

    function getCurrentPerPerson(callback) {
        var _db = new sqlite3.Database(Config.dbPath, function(error) {
            if (error) {
                _logger.error(error);
                _db.close();
                callback(undefined);
            } else {
                _db.all('select (u.firstName || " " || u.lastName) as name, count(p.amount) as pours, sum(p.amount) as totalAmount from User u, KegPours p, Keg k where u.badgeId = p.userId and p.kegId = (select inKeg.id from Keg inKeg order by inKeg.loaded desc limit 1) group by u.badgeId order by totalAmount desc', function(error2, rows) {
                    if (error2) {
                        _logger.error(error2);
                    }
                    _db.close();
                    callback(rows);
                });
            }
        });
    }

    function getCurrentPerTime(callback) {
        var _db = new sqlite3.Database(Config.dbPath, function(error) {
            if (error) {
                _logger.error(error);
                _db.close();
                callback(undefined);
            } else {
                _db.all('select strftime("%H", p.poured, "localtime") as timePoured, count(p.amount) as pours, sum(p.amount) as totalAmount from KegPours p where p.kegId = (select inKeg.id from Keg inKeg order by inKeg.loaded desc limit 1) group by timePoured order by timePoured', function(error2, rows) {
                    if (error2) {
                        _logger.error(error2);
                    }
                    _db.close();
                    callback(rows);
                });
            }
        });
    }

    function getKegPoursPerPerson(user, callback) {
        var _db = new sqlite3.Database(Config.dbPath, function(error) {
            if (error) {
                _logger.error(error);
                _db.close();
                callback(undefined);
            } else {
                _db.all('SELECT keg.brewer || " " || keg.name as beer, count(kegPours.id) as pours, sum(kegPours.amount) as amount FROM User usr, Keg keg, KegPours kegPours WHERE usr.badgeId = kegPours.userId AND usr.badgeId = ? AND kegPours.kegId = keg.id GROUP BY keg.id', [user.badgeId], function(error2, rows) {
                    if (error2) {
                        _logger.error(error2);
                    }
                    _db.close();
                    callback(rows);
                });
            }
        });
    }

    function generatePerPersonObject(rows) {
        var result = new Object();
        if (typeof rows !== 'undefined' && rows.length > 0) {
            for (var i = 0; i < rows.length; i++) {
                var row = rows[i];
                result[row.name] = {
                    totalAmount: row.totalAmount,
                    pours: row.pours
                }
            }
        }
        return result;
    }

    function generatePerTimeObject(rows) {
        var result = new Object();
        if (typeof rows !== 'undefined' && rows.length > 0) {
            for (var i = 0; i < rows.length; i++) {
                var row = rows[i];
                result[row.timePoured] = {
                    totalAmount: row.totalAmount,
                    pours: row.pours
                }
            }
        }
        return result;
    }

    return {
        start: init,
        allTimePourAmountPerPerson: getAllTimePerPerson,
        allTimePourAmountPerTime: getAllTimePerTime,
        currentKegPourAmountPerPerson: getCurrentPerPerson,
        currentKegPourAmountPerTime: getCurrentPerTime,
        transformPersonRow: generatePerPersonObject,
        transformTimeRow: generatePerTimeObject
    }
}());
module.exports = Stats;
