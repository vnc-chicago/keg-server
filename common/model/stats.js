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
                _db.all('select (u.firstName || " " || u.lastName) as name, sum(p.amount) as totalAmount from User u, KegPours p where u.badgeId = p.userId group by u.badgeId order by totalAmount desc', function(error2, rows) {
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
                _db.all('select time(poured) as timePoured, sum(amount) as totalAmount from KegPours group by timePoured order by timePoured', function(error2, rows) {
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
                _db.all('select (u.firstName || " " || u.lastName) as name, sum(p.amount) as totalAmount from User u, KegPours p, Keg k where u.badgeId = p.userId and p.kegId = (select inKeg.id from Keg inKeg order by inKeg.loaded desc limit 1) group by u.badgeId order by totalAmount desc', function(error2, rows) {
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
                _db.all('select time(p.poured) as timePoured, sum(p.amount) as totalAmount from KegPours p where p.kegId = (select inKeg.id from Keg inKeg order by inKeg.loaded desc limit 1) group by timePoured order by timePoured', function(error2, rows) {
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
                result[row.name] = row.totalAmount;
            }
        }
        return result;
    }

    function generatePerTimeObject(rows) {
        var result = new Object();
        if (typeof rows !== 'undefined' && rows.length > 0) {
            for (var i = 0; i < rows.length; i++) {
                var row = rows[i];
                result[row.timePoured] = row.totalAmount;
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
