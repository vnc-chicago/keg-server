var http = require('http'),
    logger = null,
    sockets = null,
    main = null,
    admin = null;

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
    var request = http.request(generatePostInfo('/user/welcome', data), function(res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            console.log('Response: ' + chunk);
        });
    });
    request.write(data);
    request.end();
};

/**
 * Denies the newly scanned RFID
 */
exports.denyUser = function() {
    var request = http.request(generatePostInfo('/user/deny', new Object()), function(res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            console.log('Response: ' + chunk);
        });
    });
    request.write();
    request.end();
};

/**
 * Pushes the flow reading to all clients
 * @param flow
 */
exports.updateFlow = function(flow) {
    var obj = {flow: flow};
    var data = JSON.stringify(obj);
    var request = http.request(generatePostInfo('/update/flow', data), function(res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            console.log('Response: ' + chunk);
        });
    });
    request.write(data);
    request.end();
};

/**
 * Pushes the amount reading to all clients
 * @param amount
 */
exports.updateAmount = function(amount) {
    var obj = {amount: amount};
    var data = JSON.stringify(obj);
    var request = http.request(generatePostInfo('/update/amount', data), function(res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            console.log('Response: ' + chunk);
        });
    });
    request.write(data);
    request.end();
};

/**
 * Pushes the temperature reading to all clients
 * @param temperature
 */
exports.updateTemperature = function(temperature) {
    var obj = {temp: temperature};
    var data = JSON.stringify(obj);
    var request = http.request(generatePostInfo('/update/temp', data), function(res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            console.log('Response: ' + chunk);
        });
    });
    request.write(data);
    request.end();
};

/**
 * Pushes the new keg information to all clients
 * @param keg
 */
exports.updateKeg = function(keg) {
    var data = JSON.stringify(keg);
    var request = http.request(generatePostInfo('/update/keg', data), function(res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            console.log('Response: ' + chunk);
        });
    });
    request.write(data);
    request.end();
};

/**
 * Pushes the updated stats to all clients
 */
exports.updateStats = function() {

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

function generatePostInfo(path, data) {
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