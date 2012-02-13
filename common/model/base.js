/**
 * Base class for all models
 */
function Base() {
    this.db = null;
    this.logger = null;
    this.FULL_KEG = 1984; //oz
}
module.exports = Base;

Base.prototype.setLogger = function(loggerInstance) {
    this.logger = loggerInstance;
}

/**
 * Check to see if local
 */
Base.prototype.checkIfLocal = function(isLocal) {
    return typeof isLocal === 'boolean';
};

/**
 * Open the db connection
 */
Base.prototype.openDB = function() {
};

/**
 * Close the db connection
 */
Base.prototype.closeDB = function() {
};


