var spawn = require('child_process').spawn;
var fs = require('fs');
var eventEmitter = require('events').EventEmitter;

var PROPERTIES = {
    location : '/home/bod-admin/Repositories/keg-server/public/images/users/',
    format : '.png',
    preArgs : ["-r", "200x300", "--no-banner", "--png", "--save"]
};

var Camera = function() {
    eventEmitter.call(this);
    this.props = PROPERTIES;
    return this;
};

Camera.super_ = eventEmitter;
Camera.prototype = Object.create(eventEmitter.prototype);

Camera.prototype.snap = function(name) {
    var preArgs = this.props.preArgs;
    var savePath = this.props.location + name + this.props.format;
    preArgs.push(savePath);
    var snap = spawn('fswebcam', preArgs);

    var self = this;
    snap.on('exit', function(code) {
        self.emit('done');
    })
};

module.exports = Camera;