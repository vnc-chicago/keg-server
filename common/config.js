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
