/*
 * Sets up the initial database
 */

var sqlite3 = require('sqlite3'),
    db = new sqlite3.Database('./db/keg.db'),
    isDebug = true;

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
        "loaded TEXT DEFAULT CURRENT_DATE)", errorHandler);

    db.run("create table User (" +
        "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
        "badgeId TEXT NOT NULL, " +
        "name TEXT NOT NULL, " +
        "title TEXT NOT NULL, " +
        "totalPours INTEGER DEFAULT 0, " +
        "joined TEXT DEFAULT CURRENT_DATE)", errorHandler);

    db.run("create table KegPours ( " +
        "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
        "userId INTEGER NOT NULL, " +
        "kegId INTEGER NOT NULL, " +
        "amount INTEGER NOT NULL, " +
        "poured TEXT NOT NULL, " +
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

    db.run("insert into Achievement (name) values ('Das Boot')", errorHandler);
        db.run("insert into Achievement (name) values ('Just Topping Off')", errorHandler);
        db.run("insert into Achievement (name) values ('Early Bird')", errorHandler);
        db.run("insert into Achievement (name) values ('Night Owl')", errorHandler);
        db.run("insert into Achievement (name) values ('Weekend Warrior')", errorHandler);

    if (isDebug == true) {
        db.run("insert into Keg (description, name, amount, loaded) values ('Tasty brew local to Chicago', '312', 100, strftime('%Y-%m-01'))", errorHandler);
        db.run("insert into Keg (description, name, amount, loaded) values ('Excellent lager with great taste', 'Samuel Adams Boston Lager', 100, strftime('%Y-%m-02'))", errorHandler);

        db.run("insert into User (badgeId, name, title) values ('0000B36CE0', 'Jay', 'Developer')", errorHandler);
        db.run("insert into User (badgeId, name, title) values (1234567890, 'Kurt', 'Developer')", errorHandler);
        db.run("insert into User (badgeId, name, title) values (2345678901, 'Tom', 'Support')", errorHandler);
        db.run("insert into User (badgeId, name, title) values (3456789012, 'Gaylord', 'Fallen Hero')", errorHandler);

        db.run("insert into KegPours (userId, kegId, amount, poured) values(1, 1, 8, strftime('%Y-%m-01 14:00:00'))", errorHandler);
        db.run("insert into KegPours (userId, kegId, amount, poured) values(1, 1, 3, strftime('%Y-%m-02 14:00:00'))", errorHandler);
        db.run("insert into KegPours (userId, kegId, amount, poured) values(1, 1, 2, strftime('%Y-%m-04 15:00:00'))", errorHandler);
        db.run("insert into KegPours (userId, kegId, amount, poured) values(1, 1, 10, strftime('%Y-%m-05 15:00:00'))", errorHandler);
        db.run("insert into KegPours (userId, kegId, amount, poured) values(1, 1, 6, strftime('%Y-%m-07 15:00:00'))", errorHandler);
        db.run("insert into KegPours (userId, kegId, amount, poured) values(1, 2, 6, strftime('%Y-%m-10 14:00:00'))", errorHandler);
        db.run("insert into KegPours (userId, kegId, amount, poured) values(1, 2, 6, strftime('%Y-%m-13 14:00:00'))", errorHandler);
        db.run("insert into KegPours (userId, kegId, amount, poured) values(1, 2, 5, strftime('%Y-%m-13 15:00:00'))", errorHandler);
        db.run("insert into KegPours (userId, kegId, amount, poured) values(1, 2, 9, strftime('%Y-%m-16 15:00:00'))", errorHandler);
        db.run("insert into KegPours (userId, kegId, amount, poured) values(1, 2, 3, strftime('%Y-%m-17 15:00:00'))", errorHandler);

        db.run("insert into KegPours (userId, kegId, amount, poured) values(2, 1, 10, strftime('%Y-%m-01 14:00:00'))", errorHandler);
        db.run("insert into KegPours (userId, kegId, amount, poured) values(2, 1, 3, strftime('%Y-%m-04 15:00:00'))", errorHandler);
        db.run("insert into KegPours (userId, kegId, amount, poured) values(2, 1, 8, strftime('%Y-%m-05 15:00:00'))", errorHandler);
        db.run("insert into KegPours (userId, kegId, amount, poured) values(2, 1, 9, strftime('%Y-%m-09 15:00:00'))", errorHandler);
        db.run("insert into KegPours (userId, kegId, amount, poured) values(2, 2, 3, strftime('%Y-%m-10 14:00:00'))", errorHandler);
        db.run("insert into KegPours (userId, kegId, amount, poured) values(2, 2, 2, strftime('%Y-%m-12 14:00:00'))", errorHandler);
        db.run("insert into KegPours (userId, kegId, amount, poured) values(2, 2, 7, strftime('%Y-%m-14 15:00:00'))", errorHandler);
        db.run("insert into KegPours (userId, kegId, amount, poured) values(2, 2, 10, strftime('%Y-%m-16 15:00:00'))", errorHandler);
        db.run("insert into KegPours (userId, kegId, amount, poured) values(2, 2, 4, strftime('%Y-%m-21 15:00:00'))", errorHandler);

    }

    db.close();
});

function errorHandler(error) {
    if (error) {
        console.error(error);
    }
}

