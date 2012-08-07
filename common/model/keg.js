var sqlite3 = require('sqlite3');
var Config = require('../config');
var winston = require('winston');

var Keg = (function() {

    function init() {
    }

    function getCurrentKeg(callback) {
        var _db = new sqlite3.Database(Config.dbPath, function(error) {
            if (error) {
                winston.error(error);
                _db.close();
                callback(undefined);
            } else {
                _db.get('SELECT id, brewer, name, description, amount, loaded FROM Keg ORDER BY loaded DESC', function(error2, row) {
                    if (error2) {
                        winston.error(error2);
                    }
                    _db.close();
                    callback(row);
                });
            }
        });
    }

    function updateAmount(pourAmount, callback) {
        var _db = new sqlite3.Database(Config.dbPath, function(error) {
            if (error) {
                winston.error(error);
                _db.close();
                callback(error);
            } else {
                _db.run("UPDATE Keg SET amount = amount - ? where id = (select id from Keg order by loaded desc limit 1)", [pourAmount], function(error2) {
                    if (error2) {
                        winston.error(error2);
                    }
                    _db.close();
                    callback(error2);
                });
            }
        });
    }


    function _createNew(keg, callback) {
        var _db = new sqlite3.Database(Config.dbPath, function(error) {
            if (error) {
                winston.error(error);
                _db.close();
                callback(error);
            } else {
                _db.run('INSERT INTO Keg (brewer, name, description, amount) VALUES (?, ?, ?, ?)', [keg.brewer, keg.name, keg.description, 1984], function(error2) {
                    if (error2) {
                        winston.error(error2);
                    }
                    _db.close();
                    callback(error2);
                });
            }
        });
    }

    return {
        start : init,
        currentKeg : getCurrentKeg,
        updateAmount : updateAmount,
        createNew : _createNew
    }
}());
module.exports = Keg;
