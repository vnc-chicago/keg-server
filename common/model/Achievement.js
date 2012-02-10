var Base = require('./Base.js');

/**
 * Model structure for achievements
 */
function Achievement(isLocal) {
  Base.call(this);
  this.id = -1;
  this.name = "";
  this.description = "";

  var openDB = false;
  if(typeof isLocal === 'boolean') {
    openDB = isLocal;
  }

  if(openDB) {
  }
}
Achievement.prototype = Base;
Achievement.prototype.constructor = Achievement;
