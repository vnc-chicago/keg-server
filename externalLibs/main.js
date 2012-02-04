var sockets = null,
    logger = null,
    clients = [],
    kegPourAmountsPerTime,
    allTimePourAmountsPerTime,
    kegPourAmountsPerPerson,
    allTimePourAmountsPerPerson;

exports.start = function(socketsInstance, loggerInstance) {
    sockets = socketsInstance;
    sockets.on('connection', _onConnection);
    logger = loggerInstance;
};

exports.welcomeUser = function(user) {
    clients.forEach(function(client) {
        client.emit('welcomeUser', {user: user});
    });
};

exports.denyUser = function() {
    clients.forEach(function(client) {
        client.emit('denyUser', {});
    });
};

exports.updateFlow = function(flow) {
    clients.forEach(function(client) {
        client.emit('flowUpdate', {flow: flow});
    });
};

exports.updateAmount = function(amount) {
    clients.forEach(function(client) {
        client.emit('amountUpdate', {amount: amount});
    });
};

exports.updateTemp = function(temp) {
    clients.forEach(function(client) {
        client.emit('temperatureUpdate', {temp: temp});
    }
};

exports.updateKeg = function(keg) {
    clients.forEach(function(client) {
        client.emit('kegUpdate', {keg: keg});
    });
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

    clients.forEach(function(client) {
        _emitAllTimePoursPerPersonUpdate(allTimePourAmountsPerPerson, client);
        _emitAllTimePoursPerTimeUpdate(allTimePourAmountsPerTime, client);
        _emitKegPoursPerPersonUpdate(kegPourAmountsPerPerson, client);
        _emitKegPoursPerTimeUpdate(kegPourAmountsPerTime, client);
    });
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
    clients.push(client);

    if(logger) {
        logger.info("Client connected: " + client.toString());
    }

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

    client.on('disconnect', function() {
        clients.splice(clients.indexOf(client), 1);
    })
}