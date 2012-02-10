var Base = require('./Base.js');

/**
 * Model structure for user achievements
 */
function UserAchievement(isLocal) {
  Base.call(this);
  this.userId = -1;
  this.achievementId = -1;

  var openDB = false;
  if(typeof isLocal === 'boolean') {
    openDB = isLocal;
  }

  if(openDB) {
  }
}
UserAchievement.prototype = Base;
UserAchievement.prototype.constructor = UserAchievement;
