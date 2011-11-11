var logger = null,
    sockets = null,
    main = null,
    currentClients = new Array(),
    currentKeg = null,
    lastUser = null;

exports.start = function(socketsInstance, loggerInstance, mainInstance) {
    sockets = socketsInstance;
    sockets.on('connection', _onConnection);
    sockets.on('getAllTimePours', exports.getAllTimePours);
    logger = loggerInstance;
    main = mainInstance;
};

exports.welcomeUser = function(user) {
    lastUser = user;
    currentClients.forEach(_emitWelcome, user);
};

exports.denyUser = function() {
    currentClients.forEach(_emitDenial);
};

exports.updateFlow = function(flow) {
    currentClients.forEach(_emitFlowUpdate, flow);
};

exports.updateAmount = function(amount) {
    currentClients.forEach(_emitAmountUpdate, formatKegAmount(amount));
};

exports.updateTemperature = function(temperature) {
    currentClients.forEach(_emitTemperatureUpdate, temperature);
};

exports.updateKeg = function(keg) {
    currentKeg = keg;
    currentClients.forEach(_emitKegUpdate, keg);
};

exports.getAllTimePours = function(client) {
    if(main) {
        main.db_io.getAllTimePourAmounts(function(rows) {
            client.emit('allTimePours', { rows: rows });
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
    client.on('disconnect', _onDisconnect);
}

function _onDisconnect() {
    logger.info("Client disconnected");
}