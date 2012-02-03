var sockets = null,
    logger = null,
    currentClients = new Array();

var kegPourAmountsPerTime = null;
var allTimePourAmountsPerTime = null;
var kegPourAmountsPerPerson = null;
var allTimePourAmountsPerPerson = null;

exports.start = function(socketsInstance, loggerInstance) {
    sockets = socketsInstance;
    sockets.on('connection', _onConnection);
    logger = loggerInstance;
};

exports.welcomeUser = function(user) {
    for(var i = 0; i < currentClients.length; i++) {
        currentClients[i].emit('welcomeUser', {user: user});
    }
};

exports.denyUser = function() {
    for(var i = 0; i < currentClients.length; i++) {
        currentClients[i].emit('denyUser', {});
    }
};

exports.updateFlow = function(flow) {
    for(var i = 0; i < currentClients.length; i++) {
        currentClients[i].emit('flowUpdate', {flow: flow});
    }
};

exports.updateAmount = function(amount) {
    for(var i = 0; i < currentClients.length; i++) {
        currentClients[i].emit('amountUpdate', {amount: amount});
    }
};

exports.updateTemp = function(temp) {
    for(var i = 0; i < currentClients.length; i++) {
        currentClients[i].emit('temperatureUpdate', {temp: temp});
    }
};

exports.updateKeg = function(keg) {
    for(var i = 0; i < currentClients.length; i++) {
        currentClients[i].emit('kegUpdate', {keg: keg});
    }
};

exports.updateStats = function(stats) {
    for (var prop in stats) {
        if(prop == 'kegPourAmountsPerTime') {
            kegPourAmountsPerTime = _formatPourPerTime(stats[prop]);
        } else if(prop == 'allTimePourAmountsPerTime') {
            allTimePourAmountsPerTime = _formatPourPerTime(stats[prop]);
        } else if(prop == 'kegPourAmountsPerPerson') {
            kegPourAmountsPerPerson = _formatPourPerPerson(stats[prop]);
        } else if(prop == 'allTimePourAmountsPerPerson') {
            allTimePourAmountsPerPerson = _formatPourPerPerson(stats[prop]);
        }
    }

    for(var i = 0; i < currentClients.length; i++) {
        logger.debug("Emitting: " + i);
        _emitAllTimePoursPerPersonUpdate(allTimePourAmountsPerPerson, currentClients[i]);
        _emitAllTimePoursPerTimeUpdate(allTimePourAmountsPerTime, currentClients[i]);
        _emitKegPoursPerPersonUpdate(kegPourAmountsPerPerson, currentClients[i]);
        _emitKegPoursPerTimeUpdate(kegPourAmountsPerTime, currentClients[i]);
    }
};

function _formatPourPerTime(data) {
    var result = new Array();
    for(var obj in data) {
        result.push({
            "timePoured" : obj,
            "totalAmount" : data[obj]
        });
    }
    result.sort(function(a, b) {
        return b.time - a.time;
    });
    return result;
}

function _formatPourPerPerson(data) {
    var result = new Array();
    for(var obj in data) {
        result.push({
            "name" : obj,
            "totalAmount" : data[obj]
        });
    }
    result.sort(function(a, b) {
        return b.amount - a.amount;
    });
    return result;
}

function _emitAllTimePoursPerPersonUpdate(data, client) {
    client.emit('allTimePoursPerPersonUpdate', {data : data});
}

function _emitAllTimePoursPerTimeUpdate(data, client) {
    client.emit('allTimePoursPerTimeUpdate', {data : data});
}

function _emitKegPoursPerPersonUpdate(data, client) {
    client.emit('kegPoursPerPersonUpdate', {data : data});
}

function _emitKegPoursPerTimeUpdate(data, client) {
    client.emit('kegPoursPerTimeUpdate', {data : data});
}

function _onConnection(client) {
    if(logger) {
        logger.info("Client connected: " + client.toString());
    }

    currentClients.push(client);

    if(allTimePourAmountsPerPerson) {
        _emitAllTimePoursPerPersonUpdate(allTimePourAmountsPerPerson, client);
    }

    if(allTimePourAmountsPerTime) {
        _emitAllTimePoursPerTimeUpdate(allTimePourAmountsPerTime, client);
    }

    if(kegPourAmountsPerPerson) {
        _emitKegPoursPerPersonUpdate(kegPourAmountsPerPerson, client);
    }

    if(kegPourAmountsPerTime) {
        _emitKegPoursPerTimeUpdate(kegPourAmountsPerTime, client);
    }

    client.on('disconnect', _onDisconnect);
}

function _onDisconnect(client) {
    var index = currentClients.indexOf(client);
    if(index >= 0 && index < currentClients.length) {
        currentClients.splice(index, 1);
    }
}