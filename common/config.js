/**
 * Singleton class to define all configuration options
 */
var Config = (function() {
    return {
        /**
         * Whether or not to simulate Arduino messages
         */
        isDebug : true,

        /**
         * Whether or not debugging admin, only matters if isDebug is true
         */
        isAdminDebug : false,

        /**
         * Whether or not has webcam
         */
        hasCamera : false,

        /**
         * Type of image to take
         */
        pictureType : '.png',

        /**
         * Temporary path pictures will be stored in
         */
        localPictureLocation : '/tmp/',

        /**
         * Path user images will be stored in relative to caller file's current location
         */
        externalPictureLocation : './public/images/users/',

        /**
         * Path Arduino is connected to
         */
        devicePath : '/dev/ttyACM0',

        /**
         * Port local server should listen to
         */
        localPort : 3000,

        /**
         * Location of external server to push data to
         */
        externalServerUrl : 'localhost',

        /**
         * Port external server is listening to
         */
        externalPortListener : 8080,

        /**
         * Port external server is running on
         */
        externalPortRunner : 8080,

        /**
         * Path to db
         */
        dbPath : './db/keg.sqlite3',

        /**
         * Timeout for duplicate card scans in ms
         */
        scanTimeout : 30000
    }
}());
module.exports = Config;
