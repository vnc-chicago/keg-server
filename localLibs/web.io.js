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
    var request = http.request(generatePostInfo('/user/welcome'));
    request.write(user);
    request.end();
};

/**
 * Denies the newly scanned RFID
 */
exports.denyUser = function() {
    var request = http.request(generatePostInfo('/user/deny'));
    request.write();
    request.end();
};

/**
 * Pushes the flow reading to all clients
 * @param flow
 */
exports.updateFlow = function(flow) {
    var obj = {flow: flow};
    var request = http.request(generatePostInfo('/update/flow'));
    request.write(obj);
    request.end();
};

/**
 * Pushes the amount reading to all clients
 * @param amount
 */
exports.updateAmount = function(amount) {
    var obj = {amount: amount};
    var request = http.request(generatePostInfo('/update/amount'));
    request.write(obj);
    request.end();
};

/**
 * Pushes the temperature reading to all clients
 * @param temperature
 */
exports.updateTemperature = function(temperature) {
    var obj = {temp: temperature};
    var request = http.request(generatePostInfo('/update/temp'));
    request.write(obj);
    request.end();
};

/**
 * Pushes the new keg information to all clients
 * @param keg
 */
exports.updateKeg = function(keg) {
    var request = http.request(generatePostInfo('/update/keg'));
    request.write(keg);
    request.end();
};

/**
 * Pushes the updated stats to all clients
 */
exports.updateStats = function() {

};

function generatePostInfo(path) {
    var postOptions = {
      host: "localhost",
      port: 8000,
      path: path,
      method: 'POST'
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