var Base = require('./base');
var util = require('util');

/**
 * Model structure for users
 */

function User(isLocal) {
    this.id = "";
    this.firstName = "";
    this.lastName = "";
    this.affiliation = "";
    this.twitter = "";
    this.imagePath = "";
    this.joined = new Date();
    this.isLocal = isLocal;
}
util.inherits(User, Base);
module.exports = User;

User.prototype.byTag = function(tag) {

};
