var http = require('http'),
    logger = null,
    sockets = null,
    main = null,
    currentClients = new Array();

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
 * Welcomes the newly scanned RFID
 * @param user
 */
exports.welcomeUser = function(user) {
    var data = JSON.stringify(user);
    var request = http.request(generatePostInfo('/user/welcome', data));
    request.write(data);
    request.end();
};

/**
 * Denies the newly scanned RFID
 */
exports.denyUser = function() {
    var request = http.request(generatePostInfo('/user/deny', new Object()));
    request.write();
    request.end();
};

/**
 * Pushes the flow reading to all clients
 * @param flow
 */
exports.updateFlow = function(flow) {
    var data = {
        'flow' : flow
    };
    var request = http.request(generatePostInfo('/update/flow', data));
    request.write(data);
    request.end();
};

/**
 * Pushes the amount reading to all clients
 * @param amount
 */
exports.updateAmount = function(amount) {
    var data = {
        'amount' : amount
    };
    var request = http.request(generatePostInfo('/update/amount', data));
    request.write(data);
    request.end();
};

/**
 * Pushes the temperature reading to all clients
 * @param temperature
 */
exports.updateTemperature = function(temperature) {
    var data = {
        'temp' : temperature
    };
    var request = http.request(generatePostInfo('/update/temp', data));
    request.write(data);
    request.end();
};

/**
 * Pushes the new keg information to all clients
 * @param keg
 */
exports.updateKeg = function(keg) {
    var data = JSON.stringify(keg);
    var request = http.request(generatePostInfo('/update/keg', data));
    request.write(data);
    request.end();
};

/**
 * Pushes the updated stats to all clients
 */
exports.updateStats = function() {

};

function generatePostInfo(path, data) {
    var postOptions = {
      host: "beerondemand.com",
      port: 80,
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
    currentClients.push(client);
}

function _onDisconnect() {
    logger.info("Client disconnected");
}