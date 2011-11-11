var sqlite3 = require('sqlite3').verbose(),
    db = null,
    logger;

exports.start = function(dbCallback, loggerInstance) {
    logger = loggerInstance;
    db = new sqlite3.Database('./db/keg.db', dbCallback);
};

/**
 * Record a new keg
 * Requires name, description
 * @param keg
 */
exports.createKeg = function(keg, callback) {
    if (db != null) {
        db.run("INSERT INTO Keg (name, description, amount) values (?,?,?)", [keg.name, keg.description, keg.amount], function(error) {
            if (error) {
                logger.error(error);
                _returnValue(callback, error)
            } else {
                _returnValue(callback);
            }
        });
    }
};

/**
 * Record a new user
 * Requires name, title, badgeId
 * @param user
 */
exports.createUser = function(user, callback) {
    if (db != null) {
        db.run("INSERT INTO User (name, title, badgeId) values (?,?,?)", [user.name, user.title, user.badgeId], function(error) {
            if (error) {
                logger.error(error);
                _returnValue(callback, error)
            } else {
                _returnValue(callback);
            }
        });
    }
};

/**
 * Record a new keg status
 * Requires kegId, amountLeft, temperature
 * @param status
 */
exports.createKegStatus = function(status, callback) {
    if (db != null) {
        db.run("INSERT INTO KegStatus (kegId, temperature) values (?,?)", [status.kegId, status.temperature], function(error) {
            if (error) {
                logger.error(error);
                _returnValue(callback, error)
            } else {
                _returnValue(callback);
            }
        });
    }
};

/**
 * Record a keg pour
 * Requires a kegId, userId, amount
 * @param pour
 */
exports.createKegPour = function(pour, callback) {
    if (db != null) {
        db.run("INSERT INTO KegPours (kegId, userId, amount) values (?,?,?)", [pour.kegId, pour.userId, pour.amount], function(error) {
            if (error) {
                logger.error(error);
                _returnValue(callback, error);
            } else {
                exports.updateUserPourCount(pour.userId, function() {});
                exports.updateKegAmount(pour.amount, callback);
            }
        });
    }
};

exports.updateUserPourCount = function(userId, callback) {
    if(db != null) {
        db.run("UPDATE User SET totalPours = totalPours + 1 WHERE id = ?", [userId], function(error) {
            if(error) {
                logger.error(error);
                _returnValue(callback, error);
            } else {
                _returnValue(callback);
            }
        })
    }
};

exports.updateKegAmount = function(pourAmount, callback) {
    if(db != null) {
        db.run("UPDATE Keg SET amount = amount - ? where id = (select id from Keg order by loaded desc limit 1)", [pourAmount], function(error) {
            if(error) {
                logger.error(error);
                _returnValue(callback, error);
            } else {
                _returnValue(callback);
            }
        })
    }
};

/**
 * Get the current keg
 * Returns a keg with the following properties:
 *   1. id (integer)
 *   2. amount (integer)
 *   3. description (text)
 *   4. loaded (UTC text)
 *   5. name (text)
 * @param callback
 */
exports.getCurrentKeg = function(callback) {
    if (db != null) {
        db.get("SELECT * FROM Keg ORDER BY loaded DESC", function(error, row) {
            if (error) {
                logger.error(error);
            } else {

                _returnValue(callback, row);
            }
        })
    }
};

/**
 * Gets current and all previous kegs
 * Each row returns a keg with properties exactly like calling getCurrentKeg
 * @see exports.getCurrentKeg
 * @param callback
 */
exports.getKegHistory = function(callback) {
    if (db != null) {
        db.all("SELECT * FROM Keg", function(error, rows) {
            if (error) {
                logger.error(error);
            } else {
                _returnValue(callback, rows);
            }
        })
    }
};

/**
 * Gets all keg status history
 * Each row contains a status object with the following properties:
 *   1. id (integer)
 *   2. kegId (integer)
 *   3. amountLeft (integer)
 *   4. taken (UTC text)
 *   5. temperature (integer)
 * @param keg
 * @param callback
 */
exports.getKegStatusHistory = function(keg, callback) {
    if (db != null) {
        db.all("SELECT * FROM KegStatus WHERE id = ?", keg.id, function(error, rows) {
            if (error) {
                logger.error(error);
            } else {
                _returnValue(callback, rows);
            }
        })
    }
};

exports.getKegStartingAmount = function(keg, callback) {
    if(db != null) {
        db.get('SELECT amount FROM KegStatus WHERE id = ? ORDER BY taken DESC'), [keg.id], function(error, row) {
            if(error) {
                logger.error(error);
            } else {
                _returnValue(callback, row);
            }
        }
    }
}

/**
 * Gets all keg pour history
 * Each row contains a status object with the following properties:
 *   1. id (integer)
 *   2. kegId (integer)
 *   3. userId (integer)
 *   4. poured (UTC text)
 *   5. amount (integer)
 * @param keg
 * @param callback
 */
exports.getKegPoursHistory = function(keg, callback) {
    if (db != null) {
        db.all("SELECT * FROM KegStatus WHERE id = ?", keg.id, function(error, rows) {
            if (error) {
                logger.error(error);
            } else {
                _returnValue(callback, rows);
            }
        })
    }
};

/**
 * Gets a user by the badgeId
 * Returns a user with the following properties:
 *   1. id (integer)
 *   2. badgeId (integer)
 *   3. joined (UTC string)
 *   4. name (string)
 *   5. title (string)
 *   6. totalPours (integer)
 * @param rfid
 * @param callback
 */
exports.getUserByRFID = function(rfid, callback) {
    if (db != null) {
        db.get('SELECT * FROM User WHERE badgeId = ?', [rfid], function(error, row) {
            if (error) {
                logger.error(error);
            } else {
                _returnValue(callback, row);
            }
        })
    }
};

/**
 * Gets the last drinker
 * @param callback
 */
exports.getLastDrinker = function(callback) {
    if(db != null) {
        db.get('select u.id, u.name, u.title, u.joined, u.totalPours from User u, KegPours p where u.id = p.userId order by poured desc', function(error, rows) {
            if(error) {
                logger.error(error);
            } else {
                _returnValue(callback, rows);
            }
        })
    }
};

/**
 * Gets name, id, and amount poured for all users ordered from most to least all time
 * @param callback
 */
exports.getAllTimePourAmounts = function(callback) {
    if(db != null) {
        db.all('select u.name, u.id, sum(p.amount) as totalAmount from User u, KegPours p where u.id = p.userId group by u.id order by totalAmount desc', function(error, rows) {
            if (error) {
                logger.error(error);
            } else {
                _returnValue(callback, rows);
            }
        })
    }
};

/**
 * Gets name, id, and amount poured for all users ordered from most to least in this keg
 * @param callback
 */
exports.getKegPourAmounts = function(callback) {
    if(db != null) {
        db.all('select u.name, u.id, sum(p.amount) as totalAmount from User u, KegPours p, Keg k where u.id = p.userId and p.kegId = (select inKeg.id from Keg inKeg order by inKeg.loaded desc limit 1) group by u.id order by totalAmount desc', function(error, rows) {
            if (error) {
                logger.error(error);
            } else {
                _returnValue(callback, rows);
            }
        })
    }
};

/**
 * Gets user name, id that have pour amounts greater than 10
 * @param callback
 */
exports.getAllDasBoot = function(callback) {
    if(db != null) {
        db.all('select u.name, u.id from User u, KegPours p where u.id = p.userId and p.amount > 10 group by u.id', function(error, rows) {
            if (error) {
                logger.error(error);
            } else {
                _returnValue(callback, rows);
            }
        })
    }
};

/**
 * Gets user name, id that have pour amounts less than 2
 * @param callback
 */
exports.getAllJustToppingOff = function(callback) {
    if(db != null) {
        db.all('select u.name, u.id from User u, KegPours p where u.id = p.userId and p.amount < 2 group by u.id', function(error, rows) {
            if (error) {
                logger.error(error);
            } else {
                _returnValue(callback, rows);
            }
        })
    }
};

/**
 * Gets user name, id that have pours before noon central time
 * @param callback
 */
exports.getAllEarlyBird = function(callback) {
    if(db != null) {
        db.all('select u.name, u.id from User u, KegPours p where u.id = p.userId and time(p.poured) < "6:00:00" group by u.id', function(error, rows) {
            if (error) {
                logger.error(error);
            } else {
                _returnValue(callback, rows);
            }
        })
    }
};

/**
 * Gets user name, id that have pours after 5pm central time
 * @param callback
 */
exports.getAllNightOwl = function(callback) {
    if(db != null) {
        db.all('select u.name, u.id from User u, KegPours p where u.id = p.userId and time(p.poured) > "11:00:00" group by u.id', function(error, rows) {
            if (error) {
                logger.error(error);
            } else {
                _returnValue(callback, rows);
            }
        })
    }
};

/**
 * Gets user name, id that have a pour on the weekend
 * @param callback
 */
exports.getAllWeekendWarrior = function(callback) {
    if(db != null) {
        db.all('select u.id, u.name from User u, KegPours p where u.id = p.userId and (date(p.poured) = date(p.poured, "weekday 0") or date(p.poured) = date(p.poured, "weekday 6")) group by u.id', function(error, rows) {
            if (error) {
                logger.error(error);
            } else {
                _returnValue(callback, rows);
            }
        })
    }
};

/**
 * Helper function to return a value to a callback function.
 * Does some type checking to make sure callback is a function and logs if not
 * @param callback
 * @param value
 */
function _returnValue(callback, value) {
    if (typeof callback === 'function') {
        callback(value);
    } else {
        logger.warn('Callback not a function : ' + callback);
    }
}

