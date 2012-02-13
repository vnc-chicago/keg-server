var Base = require('./base');
var util = require('util');

/**
 * Model structure for keg statuses
 */
function KegStatus(isLocal) {
    this.kegId = 0;
    this.temp = 0;

    if (checkIfLocal(isLocal)) {
        openDB();
    }
}
util.inherits(KegStatus, Base);
module.exports = KegStatus;