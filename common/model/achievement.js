var Base = require('./base');
var util = require('util');

/**
 * Model structure for achievements
 */
function Achievement(isLocal) {
    this.id = -1;
    this.name = "";
    this.description = "";

    if (checkIfLocal(isLocal)) {
        openDB();
    }
}
util.inherits(Achievement, Base);
module.exports = Achievement;