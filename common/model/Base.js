/**
 * Base class for all models
 */
function Base() {}

/**
 *
 */
Base.prototype.checkIsLocal = function(isLocal) {
  return typeof isLocal === 'boolean';
}

Base.prototype.openDB = function() {
}
