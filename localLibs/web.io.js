var http = require('http'),
    logger = null,
    sockets = null,
    main = null,
    admin = null,
    currentKeg,
    lastUser;

/**
 * Initializes the web communication layer
 * @param socketsInstance
 * @param loggerInstance
 * @param mainInstance
 */
exports.start = function(socketsInstance, loggerInstance, mainInstance) {
    sockets = socketsInstance;
    sockets.on('connection', _onConnection);
    logger = loggerInstance;
    main = mainInstance;
};

/**
 * Collects the current keg and tries to push initial data
 * @param keg
 */
exports.collectCurrentKeg = function(keg) {
    currentKeg = keg;
    _pushStartingData();
};

/**
 * Collects the last user and tries to push initial data
 * @param user
 */
exports.collectLastUser = function(user) {
    lastUser = user;
    _pushStartingData();
};

/**
 * Pushes the initial data out to the external server
 */
function _pushStartingData() {
    if(currentKeg && lastUser) {
        var obj = {
            currentKeg : currentKeg,
            lastUser : lastUser
        };
        var data = JSON.stringify(obj);
        var request = http.request(_generatePostInfo('/init/data', data));
        request.write(data);
        request.end();
    }
}

/**
 * Welcomes the newly scanned RFID
 * @param user
 */
exports.welcomeUser = function(user) {
    var data = JSON.stringify(user);
    var request = http.request(_generatePostInfo('/user/welcome', data));
    request.write(data);
    request.end();
    logger.debug("Welcome user: " + data);
};

/**
 * Denies the newly scanned RFID
 */
exports.denyUser = function() {
    var request = http.request(_generatePostInfo('/user/deny', ""));
    request.write("");
    request.end();
    logger.debug("Deny user");
};

/**
 * Pushes the flow reading to all clients
 * @param flow
 */
exports.updateFlow = function(flow) {
    var obj = {flow: flow};
    var data = JSON.stringify(obj);
    var request = http.request(_generatePostInfo('/update/flow', data));
    request.write(data);
    request.end();
    logger.debug("Update flow: " + flow);
};

/**
 * Pushes the amount reading to all clients
 * @param amount
 */
exports.updateAmount = function(amount) {
    var obj = {amount: amount};
    var data = JSON.stringify(obj);
    var request = http.request(_generatePostInfo('/update/amount', data));
    request.write(data);
    request.end();
    logger.debug("Update amount: " + amount);
};

/**
 * Pushes the temperature reading to all clients
 * @param temperature
 */
exports.updateTemperature = function(temperature) {
    var obj = {temp: temperature};
    var data = JSON.stringify(obj);
    var request = http.request(_generatePostInfo('/update/temp', data));
    request.write(data);
    request.end();
    logger.debug("Update temp: " + temperature);
};

/**
 * Pushes the new keg information to all clients
 * @param keg
 */
exports.updateKeg = function(keg) {
    var data = JSON.stringify(keg);
    var request = http.request(_generatePostInfo('/update/keg', data));
    request.write(data);
    request.end();
    logger.debug("Update keg: " + keg);
};

/**
 * Pushes the updated stats to all clients
 */
exports.updateStats = function(stats) {
    var data = JSON.stringify(stats);
    var request = http.request(_generatePostInfo('/update/stats', data));
    request.write(data);
    request.end();
    logger.debug("Update stats: " + data);
};

/**
 * Prompts user to scan card
 */
exports.promptUser = function() {
    admin.emit('promptForCard');
};

/**
 * Pushes to the user that they are created correctly
 */
exports.createSuccess = function() {
    admin.emit('createSuccess');
};

/**
 * Pushes to the user the error message on creation
 * @param error
 */
exports.createFail = function(error) {
    admin.emit('createFailure', {error: error});
};

function _generatePostInfo(path, data) {
    var postOptions = {
      host: "localhost",
      port: 8080,
      path: path,
      method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': data.length
        }
    };
    return postOptions;
}

function _onConnection(client) {
    logger.info('Client connected');
    client.on('disconnect', _onDisconnect);
    admin = client;
    main.isUserEntry = true;
}

function _onDisconnect() {
    logger.info("Client disconnected");
    admin = null;
    main.isUserEntry = false;
}
