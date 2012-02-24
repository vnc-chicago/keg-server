var sqlite3 = require('sqlite3');
var Config = require('../config');
var Achievement = require('./achievement');

var UserAchievement = (function() {
    var _logger;

    function init(logger) {
        _logger = logger;
    }

    function saveAchievementsForUser(user, achievements, callback) {
        var userId = user.badgeId;
        var totalAchievements = 0;
        // Loop through achievements and save to DB if required
        for (var achievement in achievements) {
            totalAchievements++;
            recordAchievement(userId, achievements, achievement, function() {
                totalAchievements--;
                if (totalAchievements == 0) {
                    callback(achievements);
                }
            });
        }
    }

    function recordAchievement(userId, achievements, achievement, callback) {
        var _db = new sqlite3.Database(Config.dbPath, function(error) {
            if (error) {
                _logger.error(error);
                _db.close();
            } else {
                if (achievements[achievement].awarded) {
                    var achievementId = -1;
                    var isAwardedOnce = false;
                    var isAwardedOncePerDay = false;
                    switch (achievement) {
                        case 'isDoubleSixShooter':
                            achievementId = Achievement.isDoubleSixShooter;
                            isAwardedOnce = true;
                            break;
                        case 'shouldGoHome':
                            achievementId = Achievement.shouldGoHome;
                            break;
                        case 'isHalfKegger':
                            achievementId = Achievement.isHalfKegger;
                            isAwardedOnce = true;
                            break;
                        case 'isHalfCenturion':
                            achievementId = Achievement.isHalfCenturion;
                            break;
                        case 'isCenturion':
                            achievementId = Achievement.isCenturion;
                            break;
                        case 'isDecaUser':
                            achievementId = Achievement.isDecaUser;
                            break;
                        case 'isPonyRider':
                            isAwardedOnce = true;
                            achievementId = Achievement.isPonyRider;
                            break;
                        case 'isSixShooter':
                            isAwardedOnce = true;
                            achievementId = Achievement.isSixShooter;
                            break;
                        case 'isFirstPour':
                            achievementId = Achievement.isFirstPour;
                            break;
                        case 'isInForLongHaul':
                            achievementId = Achievement.isInForLongHaul;
                            break;
                        case 'isTrifecta':
                            achievementId = Achievement.isTrifecta;
                            isAwardedOncePerDay = true;
                            break;
                        case 'isEarlyBird':
                            achievementId = Achievement.isEarlyBird;
                            break;
                        case 'isPartyStarter':
                            achievementId = Achievement.isPartyStarter;
                            break;
                        case 'isGoingLong':
                            achievementId = Achievement.isGoingLong;
                            isAwardedOncePerDay = true;
                            break;
                        case 'isDirtyThirty':
                            isAwardedOnce = true;
                            achievementId = Achievement.isDirtyThirty;
                            break;
                        case 'isBeautiful':
                            achievementId = Achievement.isBeautiful;
                            isAwardedOncePerDay = true;
                            break;
                    }

                    _db.all('SELECT userId, achievementId from UserAchievement WHERE userId=? and achievementId=?', [userId, achievementId], function(error2, rows) {
                        if (error2) {
                            _logger.error(error2);
                        }

                        if (rows.length == 0) {
                            _db.run('INSERT INTO UserAchievement (userId, achievementId) VALUES (?, ?)', [userId, achievementId], function(error3) {
                                closeDB(_db, error3);
                                callback();
                            });
                        } else {
                            closeDB(_db);
                            delete achievements[achievement];
                            callback();
                        }
                    });
                } else {
                    delete achievements[achievement];
                    callback();
                }
            }
        });
    }

    function closeDB(db, error) {
        if (error) {
            _logger.error(error);
        }
        db.close();
    }

    return {
        start : init,
        saveAchievements : saveAchievementsForUser
    }
}
    ()
    )
    ;
module.exports = UserAchievement;
