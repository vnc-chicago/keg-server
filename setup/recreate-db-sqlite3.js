/*
 * Sets up the initial database
 */

var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('./db/keg.sqlite3');
var isDebug = true;
var isInsertPours = false;

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
        "brewer TEXT NOT NULL, " +
        "name TEXT NOT NULL, " +
        "description TEXT NOT NULL, " +
        "amount INTEGER NOT NULL, " +
        "loaded TEXT DEFAULT CURRENT_DATE)", errorHandler);

    db.run("create table User (" +
        "badgeId TEXT PRIMARY KEY, " +
        "firstName TEXT NOT NULL, " +
        "lastName TEXT NOT NULL, " +
        "affiliation TEXT NOT NULL, " +
        "twitter TEXT," +
        "totalPours INTEGER DEFAULT 0, " +
        "joined TEXT DEFAULT CURRENT_DATE)", errorHandler);

    db.run("create table KegPours ( " +
        "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
        "userId TEXT NOT NULL, " +
        "kegId INTEGER NOT NULL, " +
        "amount INTEGER NOT NULL, " +
        "poured TEXT DEFAULT CURRENT_TIMESTAMP, " +
        "FOREIGN KEY (kegId) REFERENCES Keg(id), " +
        "FOREIGN KEY (userId) REFERENCES User(badgeId))", errorHandler);

    db.run("create table KegStatus ( " +
        "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
        "kegId INTEGER NOT NULL, " +
        "temperature INTEGER NOT NULL, " +
        "taken TEXT DEFAULT CURRENT_TIMESTAMP, " +
        "FOREIGN KEY (kegId) REFERENCES Keg(id))", errorHandler);

    db.run("create table Achievement ( " +
        "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
        "name TEXT NOT NULL, " +
        "description TEXT NOT NULL)", errorHandler);

    db.run("create table UserAchievement ( " +
        "userId TEXT NOT NULL, " +
        "achievementId INTEGER NOT NULL, " +
        "awarded TEXT DEFAULT CURRENT_TIMESTAMP, " +
        "FOREIGN KEY (userId) REFERENCES User(badgeId), " +
        "FOREIGN KEY (achievementId) REFERENCES Achievement(id), " +
        "PRIMARY KEY (userId, achievementId, awarded))", errorHandler);

    db.run("insert into Achievement (name, description) values ('The Double Sixer', 'Drank 144oz all time')", errorHandler);
    db.run("insert into Achievement (name, description) values ('Go Home!', 'Poured over the weekend')", errorHandler);
    db.run("insert into Achievement (name, description) values ('The Half Barrel', 'Drank 1980oz all time')", errorHandler);
    db.run("insert into Achievement (name, description) values ('Half Century', 'Poured 50 times')", errorHandler);
    db.run("insert into Achievement (name, description) values ('Century', 'Poured 100 times')", errorHandler);
    db.run("insert into Achievement (name, description) values ('The Decade', 'Poured 10 times')", errorHandler);
    db.run("insert into Achievement (name, description) values ('Pony Up', 'Drank 980oz all time')", errorHandler);
    db.run("insert into Achievement (name, description) values ('The Sixer', 'Drank 72oz all time')", errorHandler);
    db.run("insert into Achievement (name, description) values ('First Pour', 'Welcome to the club!')", errorHandler);
    db.run("insert into Achievement (name, description) values ('For The Long Haul', 'Pour after 6pm')", errorHandler);
    db.run("insert into Achievement (name, description) values ('The Trifecta', 'Pour 3 times in a day')", errorHandler);
    db.run("insert into Achievement (name, description) values ('Early Bird', 'Pour before 2pm')", errorHandler);
    db.run("insert into Achievement (name, description) values ('Party Starter', 'First pour of the day')", errorHandler);
    db.run("insert into Achievement (name, description) values ('Going Long', 'Pour 5 times in a day')", errorHandler);
    db.run("insert into Achievement (name, description) values ('Dirty Thirty', 'Drank 360oz all time')", errorHandler);
    db.run("insert into Achievement (name, description) values ('Hello Beautiful', 'Pour 7 times in a day')", errorHandler);

    if (isDebug) {
        db.run("insert into Keg (brewer, description, name, amount, loaded) values ('Goose Island', 'Tasty brew local to Chicago', '312', 1984, strftime('%Y-%m-01'))", errorHandler);
        db.run("insert into Keg (brewer, description, name, amount, loaded) values ('Samuel Adams', 'Excellent lager with great taste', 'Boston Lager', 1984, strftime('%Y-%m-02'))", errorHandler);

        db.run("insert into User (badgeId, firstName, lastName, affiliation) values ('a123456789', 'Jay', 'Taggart', 'COD')", errorHandler);
        db.run("insert into User (badgeId, firstName, lastName, affiliation) values ('123456789a', 'Kurt', 'Stirnkorb', 'COD')", errorHandler);
        db.run("insert into User (badgeId, firstName, lastName, affiliation) values ('23456789a1', 'Tom', 'White', 'Product Management')", errorHandler);

        if (isInsertPours) {
            db.run("insert into KegPours (userId, kegId, amount, poured) values(1, 1, 8, strftime('%Y-%m-01 13:00:00'))", errorHandler);
            db.run("insert into KegPours (userId, kegId, amount, poured) values(1, 1, 3, strftime('%Y-%m-02 14:00:00'))", errorHandler);
            db.run("insert into KegPours (userId, kegId, amount, poured) values(1, 1, 2, strftime('%Y-%m-04 14:00:00'))", errorHandler);
            db.run("insert into KegPours (userId, kegId, amount, poured) values(1, 1, 10, strftime('%Y-%m-05 15:00:00'))", errorHandler);
            db.run("insert into KegPours (userId, kegId, amount, poured) values(1, 1, 6, strftime('%Y-%m-07 15:00:00'))", errorHandler);
            db.run("insert into KegPours (userId, kegId, amount, poured) values(1, 2, 6, strftime('%Y-%m-10 15:00:00'))", errorHandler);
            db.run("insert into KegPours (userId, kegId, amount, poured) values(1, 2, 6, strftime('%Y-%m-13 12:00:00'))", errorHandler);
            db.run("insert into KegPours (userId, kegId, amount, poured) values(1, 2, 5, strftime('%Y-%m-14 16:00:00'))", errorHandler);
            db.run("insert into KegPours (userId, kegId, amount, poured) values(1, 2, 9, strftime('%Y-%m-16 16:00:00'))", errorHandler);
            db.run("insert into KegPours (userId, kegId, amount, poured) values(1, 2, 3, strftime('%Y-%m-17 15:00:00'))", errorHandler);

            db.run("insert into KegPours (userId, kegId, amount, poured) values(2, 1, 10, strftime('%Y-%m-01 14:00:00'))", errorHandler);
            db.run("insert into KegPours (userId, kegId, amount, poured) values(2, 1, 3, strftime('%Y-%m-04 14:00:00'))", errorHandler);
            db.run("insert into KegPours (userId, kegId, amount, poured) values(2, 1, 8, strftime('%Y-%m-05 15:00:00'))", errorHandler);
            db.run("insert into KegPours (userId, kegId, amount, poured) values(2, 1, 9, strftime('%Y-%m-09 15:00:00'))", errorHandler);
            db.run("insert into KegPours (userId, kegId, amount, poured) values(2, 2, 3, strftime('%Y-%m-10 15:00:00'))", errorHandler);
            db.run("insert into KegPours (userId, kegId, amount, poured) values(2, 2, 2, strftime('%Y-%m-12 16:00:00'))", errorHandler);
            db.run("insert into KegPours (userId, kegId, amount, poured) values(2, 2, 7, strftime('%Y-%m-14 15:00:00'))", errorHandler);
            db.run("insert into KegPours (userId, kegId, amount, poured) values(2, 2, 10, strftime('%Y-%m-16 16:00:00'))", errorHandler);
            db.run("insert into KegPours (userId, kegId, amount, poured) values(2, 2, 4, strftime('%Y-%m-21 14:00:00'))", errorHandler);
        }

    }

    db.close();
});

function errorHandler(error) {
    if (error) {
        console.error(error);
    }
}

