var Base = require('./Base.js');

/**
 * Model structure for keg statuses
 */
function KegStatus(isLocal) {
  Base.call(this);
  this.kegId = 0;
  this.temp = 0;

  var openDB = false;
  if(typeof isLocal === 'boolean') {
    openDB = isLocal;
  }

  if(openDB) {
  }
}
KegStatus.prototype = Base;
KegStatus.prototype.constructor = KegStatus;
