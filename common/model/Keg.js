var Base = require('./Base.js');

/**
 * Model structure for kegs
 */
function Keg(isLocal) {
  Base.call(this);
  this.id = -1;
  this.name = "";
  this.brewer = "";
  this.description = "";
  this.loaded = "";

  var openDB = false;
  if(typeof isLocal === 'boolean') {
    openDB = isLocal;
  }

  if(openDB) {
  }
}
Keg.prototype = Base;
Keg.prototype.constructor = Keg;
