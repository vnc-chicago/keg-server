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
        externalServerUrl : 'http://www.beerondemand.com/',

        /**
         * Port external server is listening to
         */
        externalPort : 80
    }
}());
module.exports = Config;
