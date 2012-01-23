var logger = null,
    sockets = null,
    db = null,
    currentClients = new Array(),
    currentKeg = null,
    lastUser = null;

/**
 * Initializes the web communication layer
 * @param socketsInstance
 * @param loggerInstance
 * @param dbInstance
 */
exports.start = function(socketsInstance, loggerInstance, dbInstance) {
    sockets = socketsInstance;
    sockets.on('connection', _onConnection);
    sockets.on('getAllTimePoursPerPerson', _getAllTimePoursPerPerson);
    sockets.on('getAllTimePoursPerTime', _getAllTimePoursPerTime);
    logger = loggerInstance;
    db = dbInstance;
};

/**
 * Welcomes the newly scanned RFID
 * @param user
 */
exports.welcomeUser = function(user) {
    lastUser = user;
    currentClients.forEach(_emitWelcome, user);
};

/**
 * Denies the newly scanned RFID
 */
exports.denyUser = function() {
    currentClients.forEach(_emitDenial);
};

/**
 * Pushes the flow reading to all clients
 * @param flow
 */
exports.updateFlow = function(flow) {
    currentClients.forEach(_emitFlowUpdate, flow);
};

/**
 * Pushes the amount reading to all clients
 * @param amount
 */
exports.updateAmount = function(amount) {
    currentClients.forEach(_emitAmountUpdate, formatKegAmount(amount));
    exports.updateStats();
};

/**
 * Pushes the temperature reading to all clients
 * @param temperature
 */
exports.updateTemperature = function(temperature) {
    currentClients.forEach(_emitTemperatureUpdate, temperature);
};

/**
 * Pushes the new keg information to all clients
 * @param keg
 */
exports.updateKeg = function(keg) {
    currentKeg = keg;
    currentClients.forEach(_emitKegUpdate, keg);
};

exports.updateStats = function() {
    for(var i = 0; i < currentClients.length; i++) {
        _getAllTimePoursPerPerson(currentClients[i]);
        _getAllTimePoursPerTime(currentClients[i]);
        _getKegPoursPerPerson(currentClients[i]);
        _getKegPoursPerTime(currentClients[i]);
    }
};


function _getAllTimePoursPerPerson(client) {
    if(db) {
        db.getAllTimePourAmountsPerPerson(function(rows) {
            client.emit('allTimePoursPerPersonUpdate', { rows: rows });
        });
    }
}

function _getAllTimePoursPerTime(client) {
    if(db) {
        db.getAllTimePourAmountsPerTime(function(rows) {
            client.emit('allTimePoursPerTimeUpdate', { rows: rows });
        });
    }
}

function _getKegPoursPerPerson(client) {
    if(db) {
        db.getKegPourAmountsPerPerson(function(rows) {
            client.emit('kegPoursPerPersonUpdate', { rows: rows });
        });
    }
}

function _getKegPoursPerTime(client) {
    if(db) {
        db.getKegPourAmountsPerTime(function(rows) {
            client.emit('kegPoursPerTimeUpdate', { rows: rows });
        });
    }
}

function _emitWelcome(client) {
    client.emit('welcome', { user: this });
}

function _emitDenial(client) {
    client.emit('denial');
}

function _emitFlowUpdate(client) {
    client.emit('flowUpdate', { flow: this });
}

function _emitAmountUpdate(client) {
    client.emit('amountUpdate', { amount: this });
}

function _emitTemperatureUpdate(client) {
    client.emit('temperatureUpdate', { temperature: this });
}

function _emitKegUpdate(client) {
    this.amount = formatKegAmount(this.amount);
    client.emit('kegUpdate', { keg: this });
}

function formatKegAmount(amount) {
    return parseFloat(parseFloat(amount).toFixed(0));
}

function _onConnection(client) {
    logger.info('Client connected');
    currentClients.push(client);
    if(currentKeg) {
        currentClients.forEach(_emitKegUpdate, currentKeg);
    }
    if(lastUser) {
        currentClients.forEach(_emitWelcome, lastUser);
    }
    exports.updateStats();
    client.on('disconnect', _onDisconnect);
}

function _onDisconnect() {
    logger.info("Client disconnected");
}