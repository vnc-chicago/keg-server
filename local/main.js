var WebIO = require('./web-io');
var KegIO = require('./keg-io');
var protocol = require('../common/protocol');
var User = require('../common/model/user');

var Main = (function () {
    var _logger;

    function init(app, logger) {
        _logger = logger;

        WebIO.start(app, logger);
        WebIO.getEmitter().on('createUser', createUser);
        WebIO.getEmitter().on('createKeg', createKeg);

        KegIO.start(logger);
        KegIO.getEmitter().on(protocol.TAG, handleTag);
        KegIO.getEmitter().on(protocol.FLOW, handleFlow);
        KegIO.getEmitter().on(protocol.POUR, handlePour);
        KegIO.getEmitter().on(protocol.TEMP, handleTemp);
    }

    function handleTag(tag) {
        // Get user
        var user = new User().byTag(tag);

        // If user exists
        if(typeof user !== 'undefined') {
            // Open valve
            KegIO.openValve();
            // Welcome user
            WebIO.welcomeUser(user);
        } else {
            // Deny user
            WebIO.denyUser();
        }
    }

    function handleFlow(flow) {
        // Push data to web
    }

    function handlePour(pour) {
        // Update current user with amount and number pours
        // Push new stats to web
    }

    function handleTemp(temp) {
        // Push temp to web
    }

    function createUser() {
        // Get badge
        // If user exists with same badge
            // Deny creation
        // Else
            // Prompt for picture
            // Wait 5 seconds
                // Take picture
                // Store user information
                // Push picture to web
    }

    function createKeg() {
        // Store keg details
        // Push keg details to web
    }

    function pushStats() {
        // Get stats
        // Push stats to web
    }

    return {
        start : init
    }
}());
module.exports = Main;