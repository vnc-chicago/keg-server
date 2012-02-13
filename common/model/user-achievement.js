var Base = require('./base');
var util = require('util');

/**
 * Model structure for user achievements
 */
function UserAchievement(isLocal) {
    this.userId = -1;
    this.achievementId = -1;

    if (checkIfLocal(isLocal)) {
        openDB();
    }
}
util.inherits(UserAchievement, Base);
exports.module = UserAchievement;