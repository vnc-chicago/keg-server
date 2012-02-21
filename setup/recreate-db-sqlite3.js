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
        "userId INTEGER NOT NULL, " +
        "kegId INTEGER NOT NULL, " +
        "amount INTEGER NOT NULL, " +
        "poured TEXT NOT NULL, " +
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
        "name TEXT NOT NULL)", errorHandler);

    db.run("create table UserAchievement ( " +
        "userId INTEGER NOT NULL, " +
        "achievementId INTEGER NOT NULL, " +
        "awarded TEXT DEFAULT CURRENT_TIMESTAMP, " +
        "FOREIGN KEY (userId) REFERENCES User(badgeId), " +
        "FOREIGN KEY (achievementId) REFERENCES Achievement(id), " +
        "PRIMARY KEY (userId, achievementId, awarded))", errorHandler);

    db.run("insert into Achievement (name) values ('isDoubleSixShooter')", errorHandler);
    db.run("insert into Achievement (name) values ('shouldGoHome')", errorHandler);
    db.run("insert into Achievement (name) values ('isHalfKegger')", errorHandler);
    db.run("insert into Achievement (name) values ('isHalfCenturion')", errorHandler);
    db.run("insert into Achievement (name) values ('isCenturion')", errorHandler);
    db.run("insert into Achievement (name) values ('isDecaUser')", errorHandler);
    db.run("insert into Achievement (name) values ('isPonyRider')", errorHandler);
    db.run("insert into Achievement (name) values ('isSixShooter')", errorHandler);
    db.run("insert into Achievement (name) values ('isFirstPour')", errorHandler);
    db.run("insert into Achievement (name) values ('isInForLongHaul')", errorHandler);
    db.run("insert into Achievement (name) values ('isTrifecta')", errorHandler);
    db.run("insert into Achievement (name) values ('isEarlyBird')", errorHandler);
    db.run("insert into Achievement (name) values ('isPartyStarter')", errorHandler);
    db.run("insert into Achievement (name) values ('isGoingLong')", errorHandler);
    db.run("insert into Achievement (name) values ('isDirtyThirty')", errorHandler);
    db.run("insert into Achievement (name) values ('isBeautiful')", errorHandler);

    if (isDebug) {
        db.run("insert into Keg (brewer, description, name, amount, loaded) values ('Goose Island', 'Tasty brew local to Chicago', '312', 1984, strftime('%Y-%m-01'))", errorHandler);
        db.run("insert into Keg (brewer, description, name, amount, loaded) values ('Samuel Adams', 'Excellent lager with great taste', 'Boston Lager', 1984, strftime('%Y-%m-02'))", errorHandler);

        db.run("insert into User (badgeId, firstName, lastName, affiliation) values ('0123456789', 'Jay', 'Taggart', 'Developer')", errorHandler);
        db.run("insert into User (badgeId, firstName, lastName, affiliation) values ('1234567890', 'Kurt', 'Stirnkorb', 'Developer')", errorHandler);
        db.run("insert into User (badgeId, firstName, lastName, affiliation) values ('2345678901', 'Tom', 'White', 'Support')", errorHandler);
        db.run("insert into User (badgeId, firstName, lastName, affiliation) values ('3456789012', 'Gaylord', 'Yu', 'Fallen Hero')", errorHandler);

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

