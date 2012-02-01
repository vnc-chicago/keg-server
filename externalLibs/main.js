var sockets = null,
    logger = null,
    currentClients = new Array();

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
        currentClients[i].emit('updateFlow', {flow: flow});
    }
};

exports.updateAmount = function(amount) {
    for(var i = 0; i < currentClients.length; i++) {
        currentClients[i].emit('updateAmount', {amount: amount});
    }
};

exports.updateTemp = function(temp) {
    for(var i = 0; i < currentClients.length; i++) {
        currentClients[i].emit('updateTemp', {temp: temp});
    }
};

exports.updateKeg = function(keg) {
    for(var i = 0; i < currentClients.length; i++) {
        currentClients[i].emit('updateKeg', {keg: keg});
    }
};

exports.updateStats = function(stats) {};

function _onConnection(client) {
    currentClients.push(client);
    client.on('disconnect', _onDisconnect);
}

function _onDisconnect(client) {
    var index = currentClients.indexOf(client);
    if(index >= 0 && index < currentClients.length) {
        currentClients.splice(index, 1);
    }
}