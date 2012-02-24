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
                _db.get('SELECT firstName, lastName, affiliation, twitter, joined, totalPours FROM User WHERE badgeId = ?', [tag], function(error2, row) {
                    if (error2) {
                        _logger.error(error2);
                    }

                    if (row) {
                        var obj = {
                            badgeId: tag,
                            firstName: row.firstName,
                            lastName: row.lastName,
                            affiliation: row.affiliation,
                            twitter: row.twitter,
                            joined: row.joined,
                            totalPours: row.totalPours,
                            achievements: {}
                        };

                        _db.all('SELECT ach.name, ach.description FROM Achievement ach, UserAchievement userAch WHERE ach.id = userAch.achievementId and userAch.userId = ?', [tag], function(error3, rows) {
                            if (error3) {
                                _logger.error(error3);
                            }
                            for (var i = 0; rows && i < rows.length; i++) {
                                var achievement = rows[i];
                                obj.achievements[achievement.name] = achievement.description;
                            }


                            _db.close();
                            callback(obj);
                        });
                    } else {
                        callback(undefined);
                    }
                });
            }
        });
    }

    function createNew(user, callback) {
        var _db = new sqlite3.Database(Config.dbPath, function(error) {
            if (error) {
                _logger.error(error);
                _db.close();
                callback(error);
            } else {
                _db.run('INSERT INTO User (badgeId, firstName, lastName, affiliation, twitter) VALUES (?,?,?,?,?)', [user.badgeId, user.firstName, user.lastName, user.affiliation, user.twitter], function(error2) {
                    if (error2) {
                        _logger.error(error2);
                    }
                    _db.close();
                    callback(error2);
                })
            }
        });
    }

    function incrementPourCount(user, callback) {
        _db = new sqlite3.Database(Config.dbPath, function(error) {
            if (error) {
                _logger.error(error);
                _db.close();
                callback(error);
            } else {
                _db.run('UPDATE User SET totalPours = ? where badgeId = ?', [user.totalPours + 1, user.badgeId], function(error2) {
                    user.totalPours = user.totalPours + 1;
                    if (error2) {
                        _logger.error(error2);
                    }
                    _db.close();
                    callback(error2, user);
                })
            }
        })
    }

    return {
        start : init,
        byTag : getByTag,
        save : createNew,
        incrementPour : incrementPourCount
    }
}());
module.exports = User;