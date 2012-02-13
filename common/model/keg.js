var Base = require('./base');
var util = require('util');

/**
 * Model structure for kegs
 */
function Keg(isLocal) {
    this.id = -1;
    this.name = "";
    this.brewer = "";
    this.description = "";
    this.loaded = "";

    if (checkIfLocal(isLocal)) {
        openDB();
    }
}
util.inherits(Keg, Base);
module.exports = Keg;