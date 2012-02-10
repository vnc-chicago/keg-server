var Base = require('./Base.js');

/**
 * Model structure for keg pours
 */
function KegPour(isLocal) {
  Base.call(this);
  this.kegId = -1;
  this.userId = -1;
  this.amount = -1;
  this.timestamp = "";

  var openDB = false;
  if(typeof isLocal === 'boolean') {
    openDB = isLocal;
  }

  if(openDB) {
  }
}
KegPour.prototype = Base;
KegPour.prototype.constructor = KegPour;
