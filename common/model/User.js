var Base = require('./Base.js');

/**
 * Model structure for users
 */

function User(isLocal) {
  Base.call(this);
  this.id = "";
  this.firstName = "";
  this.lastName = "";
  this.affiliation = "";
  this.twitter = "";
  this.imagePath = "";
  this.joined = new Date();

  var openDB = false;
  if(typeof isLocal === 'boolean') {
    openDB = isLocal;
  }  

  if(openDB) {
    // setup db
    this.db = new Object();
  }
}
User.prototype = Base;
User.prototype.constructor = User;
