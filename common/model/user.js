var sqlite3 = require('sqlite3');
var Config = require('../config');

var User = (function() {
    var _logger;

    function init(logger) {
        _logger = logger;
    }

    function getByTag(tag, callback) {
        var _db = new sqlite3.Database(Config.dbPath, function(error) {
            if (error) {
                _logger.error(error);
                _db.close();
                callback(undefined);
            } else {
                _db.get('SELECT badgeId, firstName, lastName, affiliation, twitter, totalPours, joined FROM User WHERE badgeId = ?', [tag], function(error, row) {
                    if (error) {
                        _logger.error(error);
                    }
                    _db.close();
                    callback(row);
                });
            }
        });
    }

    function createNew(user, callback) {
        var _db = new sqlite3.Database(Config.dbPath, function(error) {
            if (error) {
                _logger.error(error);
                _db.close;
                callback(error);
            } else {
                _db.run('INSERT INTO User (badgeId, firstName, lastName, affiliation, twitter) VALUES (?,?,?,?,?)', [user.badgeId, user.firstName, user.lastName, user.affiliation, user.twitter], function(error) {
                    if (error) {
                        _logger.error(error);
                    }
                    _db.close();
                    callback(error);
                })
            }
        });
    }

    function incrementPourCount(user, callback) {
        _db = new sqlite3.Database(Config.dbPath, function(error) {
            if (error) {

            } else {
                _db.run('UPDATE User SET totalPours = ? where badgeId = ?', [user.totalPours + 1, user.badgeId], function(error) {
                    if(error) {
                        _logger.error(error);
                    }
                    _db.close();
                    callback(error);
                })
            }
        })
    }

    return {
        start : init,
        byTag : getByTag,
        create : createNew,
        incrementPour : incrementPourCount
    }
}());
module.exports = User;