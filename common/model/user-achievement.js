var sqlite3 = require('sqlite3');
var Config = require('../config');
var Achievement = require('./achievement');

var UserAchievement = (function() {
    var _logger;

    function init(logger) {
        _logger = logger;
    }

    function saveAchievementsForUser(user, achievements) {
        var userId = user.badgeId;
        // Loop through achievements and save to DB if required
        for (var achievement in achievements) {
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

            if(achievements[achievement] === true && achievementId !== -1) {
                recordAchievement(userId, achievementId, isAwardedOnce, isAwardedOncePerDay);
            }
        }
    }

    function recordAchievement(userId, achievementId, isAwardedOnce, isAwardedOncePerDay) {
        var _db = new sqlite3.Database(Config.dbPath, function(error) {
            if (error) {
                _logger.error(error);
                _db.close();
            } else {
                if (isAwardedOnce) {
                    _db.run('INSERT INTO UserAchievement (userId, achievementId) SELECT $userId, $achievementId FROM UserAchievement WHERE NOT EXISTS (SELECT 1 FROM UserAchievement WHERE userId=$userId and achievementId=$achievementId)', {$userId:userId, $achievementId:achievementId}, function(error2) {
                        closeDB(_db, error);
                    })
                } else if(isAwardedOncePerDay) {
                    _db.run('INSERT INTO UserAchievement (userId, achievementId) SELECT $userId, $achievementId FROM UserAchievement WHERE NOT EXISTS (SELECT 1 FROM UserAchievement WHERE userId=$userId and achievementId=$achievementId and strftime("%Y-%m-%d", awarded)=strftime("%Y-%m-%d", "now"))', {$userId:userId, $achievementId:achievementId}, function(error2) {
                        closeDB(_db, error);
                    })
                } else {
                    _db.run('INSERT INTO UserAchievement (userId, achievementId) VALUES(?, ?)', [userId, achievementId], function(error2) {
                        closeDB(_db, error);
                    })
                }
            }
        });
    }

    function closeDB(db, error) {
        if(error) {
            _logger.error(error);
        }
        db.close();
    }

    return {
        start : init,
        saveAchievements : saveAchievementsForUser
    }
}());
module.exports = UserAchievement;
