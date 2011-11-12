/*
 * Sets up the initial database
 */

var sqlite3 = require('sqlite3');
var db = new sqlite3.Database('./db/keg.db');

db.serialize(function() {

    db.run("PRAGMA foreign_keys = ON");

    db.run("drop table if exists KegStatus", errorHandler);
    db.run("drop table if exists KegPours", errorHandler);
    db.run("drop table if exists Keg", errorHandler);
    db.run("drop table if exists User", errorHandler);
    db.run("drop table if exists Achievement", errorHandler);
    db.run("drop table if exists UserAchievement", errorHandler);

    // Create tables
    db.run("create table Keg (" +
        "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
        "name TEXT NOT NULL, " +
        "description TEXT NOT NULL, " +
        "amount INTEGER NOT NULL, " +
        "loaded TEXT DEFAULT CURRENT_TIMESTAMP)", errorHandler);

    db.run("create table User (" +
        "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
        "badgeId INTEGER NOT NULL, " +
        "name TEXT NOT NULL, " +
        "title TEXT NOT NULL, " +
        "totalPours INTEGER DEFAULT 0, " +
        "joined TEXT DEFAULT CURRENT_TIMESTAMP)", errorHandler);

    db.run("create table KegPours ( " +
        "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
        "userId INTEGER NOT NULL, " +
        "kegId INTEGER NOT NULL, " +
        "poured TEXT DEFAULT CURRENT_TIMESTAMP, " +
        "amount INTEGER NOT NULL, " +
        "FOREIGN KEY (kegId) REFERENCES Keg(id), " +
        "FOREIGN KEY (userId) REFERENCES User(id))", errorHandler);

    db.run("create table KegStatus ( " +
        "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
        "kegId INTEGER NOT NULL, " +
        "temperature INTEGER NOT NULL, " +
        "taken TEXT DEFAULT CURRENT_TIMESTAMP, " +
        "FOREIGN KEY (kegId) REFERENCES Keg(id))", errorHandler);

    db.run("create table Achievement ( " +
        "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
        "name TEXT NOT NULL)", errorHandler);

    db.run("create table UserAchievement ( " +
        "userId INTEGER NOT NULL, " +
        "achievementId INTEGER NOT NULL, " +
        "awarded TEXT DEFAULT CURRENT_TIMESTAMP, " +
        "FOREIGN KEY (userId) REFERENCES User(id), " +
        "FOREIGN KEY (achievementId) REFERENCES Achievement(id), " +
        "PRIMARY KEY (userId, achievementId, awarded))", errorHandler);

    db.run("insert into Keg (description, name, amount) values ('Tasty brew local to Chicago', '312', 100)", errorHandler);
    setTimeout(function() {
        db.run("insert into Keg (description, name, amount) values ('Excellent lager with great taste', 'Samuel Adams Boston Lager', 100)", errorHandler);
        db.close();
    }, 5000);

    db.run("insert into User (badgeId, name, title) values (0123456789, 'Jay', 'Developer')", errorHandler);
    db.run("insert into User (badgeId, name, title) values (1234567890, 'Kurt', 'Developer')", errorHandler);
    db.run("insert into User (badgeId, name, title) values (2345678901, 'Tom', 'Support')", errorHandler);
    db.run("insert into User (badgeId, name, title) values (3456789012, 'Gaylord', 'Fallen Hero')", errorHandler);

    db.run("insert into Achievement (name) values ('Das Boot')", errorHandler);
    db.run("insert into Achievement (name) values ('Just Topping Off')", errorHandler);
    db.run("insert into Achievement (name) values ('Early Bird')", errorHandler);
    db.run("insert into Achievement (name) values ('Night Owl')", errorHandler);
    db.run("insert into Achievement (name) values ('Weekend Warrior')", errorHandler);
});

function errorHandler(error) {
    if(error) {
        console.error(error);
    }
}

