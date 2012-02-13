var Base = require('./base');
var util = require('util');

/**
 * Model structure for keg pours
 */
function KegPour(isLocal) {
    this.kegId = -1;
    this.userId = -1;
    this.amount = -1;
    this.timestamp = "";

    if (checkIfLocal(isLocal)) {
        openDB();
    }
}
