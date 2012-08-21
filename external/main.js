var winston = require('winston');
var util = require('util');
var sockets = null,
    clients = [],
    kegPourAmountsPerTime,
    allTimePourAmountsPerTime,
    kegPourAmountsPerPerson,
    allTimePourAmountsPerPerson,
    currentKeg,
    lastUser,
    lastTemp;

exports.start = function(socketsInstance) {
    sockets = socketsInstance;
    sockets.on('connection', _onConnection);
};

exports.initStats = function(data) {
    if(data.currentKeg !== '') {
        currentKeg = data.currentKeg;
    } else {
        currentKeg = {
            brewer: '',
            name: '',
            loaded: '',
            description: '',
            amount: 0
        }
    }
    if(data.lastUser !== '') {
        lastUser = data.lastUser;
    } else {
        lastUser = {
            firstName: '',
            lastName: '',
            affiliation: '',
            joined: '',
            totalPours: '',
            path: ''
        }
    }
    clients.forEach(function(client) {
        _emitUpdateKeg(currentKeg, client);
        _emitUpdateLastUser(client);
    })
};

exports.welcomeUser = function(user) {
    lastUser = user;
    clients.forEach(function(client) {
        _emitWelcomeUser(user, client);
    });
};

function _emitWelcomeUser(user, client) {
    client.emit('welcomeUser', {user: user});
}

exports.denyUser = function() {
    clients.forEach(function(client) {
        _emitDenyUser(client);
    });
};

function _emitDenyUser(client) {
    client.emit('denyUser', {});
}

exports.updateFlow = function(flow) {
    clients.forEach(function(client) {
        _emitUpdateFlow(flow, client);
    });
};

function _emitUpdateFlow(flow, client) {
    client.emit('flowUpdate', {flow: flow});
}

exports.updateAmount = function(amount) {
    clients.forEach(function(client) {
        _emitUpdateAmount(amount, client);
    });
};

function _emitUpdateAmount(amount, client) {
    client.emit('amountUpdate', {amount: amount});
}

exports.updateTemp = function(temp) {
    lastTemp = temp;
    clients.forEach(function(client) {
        _emitUpdateTemp(temp, client);
    });
};

function _emitUpdateTemp(temp, client) {
    client.emit('temperatureUpdate', {temp: temp});
}

exports.updateKeg = function(keg) {
    currentKeg = keg;
    clients.forEach(function(client) {
        _emitUpdateKeg(keg, client);
    });
};

function _emitUpdateKeg(keg, client) {
    client.emit('kegUpdate', {keg: keg});
}

function _emitUpdateLastUser(client) {
    client.emit('lastUserUpdate', {user: lastUser});
}

exports.showAchievements = function(achievements) {
    clients.forEach(function(client) {
        _emitAchievementUpdate(achievements, client);
    })
};

function _emitAchievementUpdate(achievements, client) {
    client.emit('showAchievements', {achievements: achievements});
}

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
            timePoured : obj,
            totalAmount : data[obj]['totalAmount'],
            pours: data[obj]['pours']
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
            name : obj,
            totalAmount : data[obj]['totalAmount'],
            pours: data[obj]['pours']
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

    if(currentKeg) {
        _emitUpdateKeg(currentKeg, client);
    }

    if(lastUser) {
        _emitUpdateLastUser(client);
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

    if(lastTemp) {
        _emitUpdateTemp(lastTemp, client);
    }

    client.on('disconnect', function() {
        clients.splice(clients.indexOf(client), 1);
    })
}