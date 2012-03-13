socket.on('welcomeUser', welcomeUser);
socket.on('denyUser', denyUser);
socket.on('flowUpdate', updateKegFlow);
socket.on('amountUpdate', updateKegAmount);
socket.on('temperatureUpdate', updateKegTemperature);
socket.on('kegUpdate', updateKeg);
socket.on('lastUserUpdate', updateLastUser);
socket.on('allTimePoursPerPersonUpdate', updateAllTimePoursPerPerson);
socket.on('allTimePoursPerTimeUpdate', updateAllTimePoursPerTime);
socket.on('kegPoursPerPersonUpdate', updateKegPoursPerPerson);
socket.on('kegPoursPerTimeUpdate', updateKegPoursPerTime);
socket.on('showAchievements', showAchievements);

function startHandlers() {
    $('#welcomeUser').hide();
    $('#denyUser').hide();
    $('#newAchievements').hide();
    $('#welcomeUser').dialog({
        autoOpen:false,
        modal: true,
        show: 'fade',
        hide: 'fade'
    });
    $('#denyUser').dialog({
        autoOpen:false,
        modal: true,
        show: 'fade',
        hide: 'fade'
    });
    $('#newAchievements').dialog({
        autoOpen:false,
        modal: true,
        show: 'fade',
        hide: 'fade'
    });
}


function welcomeUser(data) {
    //alert("Welcome " + data.user.name);

    $('#welcomeUser').empty();
    $('#welcomeUser').append("<p>Welcome " + data.user.firstName + ' ' + data.user.lastName + "</p>")

    $('#welcomeUser').dialog('open');
    setTimeout(function() {
        $('#welcomeUser').dialog('close');
    }, 5000);

    updateUserSection(data);
}

function updateUserSection(data) {
    $('#userName').empty();
    $('#userName').append("<p>Member: " + data.user.firstName + ' ' + data.user.lastName + '</p>');

    $('#userAffiliation').empty();
    $('#userAffiliation').append("<p>Affiliation: " + data.user.affiliation + '</p>');

    $('#userJoined').empty();
    $('#userJoined').append("<p>Joined: " + data.user.joined + '</p>');

    $('#userTotalPours').empty();
    $('#userTotalPours').append("<p>Total Pours: " + data.user.totalPours + '</p>');

    $('#userImage').empty();

    if (data.user.path !== undefined && data.user.path !== '') {
        $('#userImage').append('<img src="/images/users/' + data.user.path + '.png" />');
    }

    updateUserAchievements(data.user.achievements);
}

function updateUserAchievements(achievements) {
    $('.slideshow').empty();
    for (var achievement in achievements) {
        var label = '<p>' + achievement + ': ' + achievements[achievement].description + '</p>';
        var path = achievements[achievement].path;
        if(path !== '') {
            var div = '<div><img src="/images/fluid/achievements/' + path + '.png" />' + achievements[achievement].description + '</div>'
            $('.slideshow').append(div);
        } else {
            $('.slideshow').append(label);
        }
    }
    $('.slideshow').cycle({
        fx: 'fade' // choose your transition type, ex: fade, scrollUp, shuffle, etc...
    });

}

function denyUser(data) {
    $('#denyUser').dialog('open');
    setTimeout(function() {
        $('#denyUser').dialog('close');
    }, 5000);
}

function updateKegFlow(data) {
    //alert("Flow: " + parseInt(data.flow.flow));
    var flow = formatNumber(data.flow.flow, false);
    if (!isNaN(flow)) {
        $('#gauge2 .gaugeNeedle').rotate({animateTo: flow * 100});
    }
}

function updateKegAmount(amount) {
    $('#kegAmount').empty();

    var kegAmount;
    if (amount.hasOwnProperty("amount")) {
        kegAmount = formatNumber(amount.amount, true);
    } else {
        kegAmount = formatNumber(amount, true);
    }
    $('#kegAmount').append(kegAmount + "oz");
}

/**
 * Takes in a temperature object with the following properties
 * temperature - number
 * @param data
 */
function updateKegTemperature(data) {
    var temp = formatNumber(data.temp.temp, true);
    $('#gauge .gaugeNeedle').rotate({animateTo: temp * 4});
}

/**
 * Takes in a keg object with the following properties
 * amount - number
 * description - string
 * loaded - string in YYYY-MM-DD HH:MM:SS
 * name - string
 * @param data
 */
function updateKeg(data) {
    $('#kegImage').empty();


    $('#kegTitle').empty();
    $('#kegTitle').append(data.keg.brewer + " " + data.keg.name);

    $('#kegInstalled').empty();
    $('#kegInstalled').append(data.keg.loaded);

    $('#kegDescription').empty();
    $('#kegDescription').append(data.keg.description);

    updateKegAmount(data.keg.amount);
}

/**
 *
 * @param data
 */
function updateLastUser(data) {
    updateUserSection(data);
}

function showAchievements(data) {
    //alert(data);

    $('#newAchievements').empty();
    var hasNewAchievements = false;
    for (var achievement in data.achievements) {
        hasNewAchievements = true;
        var label = '<p>' + data.achievements[achievement].name + ': ' + data.achievements[achievement].description + '</p>';
        var path = data.achievements[achievement].path;
        if(path !== '') {
            var img = '<img src="/images/fluid/achievements/' + path + '.png" />';
            var div = '<div>' + img + data.achievements[achievement].description + '</div>';
            $('.slideshow').append(div);
            $('#newAchievements').append(label);
        } else {
            $('.slideshow').append(label);
            $('#newAchievements').append(label);
        }
    }

    if (hasNewAchievements) {
        $('#newAchievements').dialog('open');
        setTimeout(function() {
            $('#newAchievements').dialog('close');
        }, 5000);
    }
    $('.slideshow').cycle({
        fx: 'fade' // choose your transition type, ex: fade, scrollUp, shuffle, etc...
    });

}

/**
 * Takes in an object with the following properties
 * data - array of objects
 * data[*].name - string
 * data[*].totalAmount - number
 * @param data
 */
function updateAllTimePoursPerPerson(data) {
    // Flow is done since stats are being updated
    $('#gauge2 .gaugeNeedle').rotate({animateTo: 0});
    $('#gauge2 .gaugeGlass').rotate({animateTo: 0});
    var xAxis = new Array();
    var chartData = new Array();

    var nameArr = $('#userName').html().split(' ');
    var name = nameArr[1] + ' ' + nameArr[2];

    for (var i = 0; i < data.data.length; i++) {
        var row = data.data[i];
        xAxis.push(row.name);
        chartData.push(formatNumber(row.totalAmount, true));
    }
    allTimePoursPerPersonCategories = xAxis;
    allTimePoursPerPersonSeries = chartData;

    initializeCharts();
}

/**
 * Takes in an object with the following properties
 * data - array of objects
 * data[*].timePoured - string 'HH:00:00'
 * data[*].totalAmount - number
 * @param data
 */
function updateAllTimePoursPerTime(data) {
    // Flow is done since stats are being updated
    $('#gauge2 .gaugeNeedle').rotate({animateTo: 0});
    $('#gauge2 .gaugeGlass').rotate({animateTo: 0});
    var xAxis = new Array();
    var chartData = new Array();


    for (var i = 0; i < data.data.length; i++) {
        var row = data.data[i];
        xAxis.push(formatTime(row.timePoured));
        chartData.push(formatNumber(row.totalAmount, true));
    }
    allTimePoursPerTimeCategories = xAxis;
    allTimePoursPerTimeSeries = chartData;

    initializeCharts();
}

/**
 * Takes in an object with the following properties
 * data - array of objects
 * data[*].timePoured - string 'HH:00:00'
 * data[*].totalAmount - number
 * @param data
 */
function updateKegPoursPerTime(data) {
    // Flow is done since stats are being updated
    $('#gauge2 .gaugeNeedle').rotate({animateTo: 0});
    $('#gauge2 .gaugeGlass').rotate({animateTo: 0});
    var xAxis = new Array();
    var chartData = new Array();


    for (var i = 0; i < data.data.length; i++) {
        var row = data.data[i];
        xAxis.push(formatTime(row.timePoured));
        chartData.push(formatNumber(row.totalAmount, true));
    }
    currentKegPoursPerTimeCategories = xAxis;
    currentKegPoursPerTimeSeries = chartData;

    initializeCharts();
}

/**
 * Takes in an object with the following properties
 * data - array of objects
 * data[*].name - string
 * data[*].totalAmount - number
 * @param data
 */
function updateKegPoursPerPerson(data) {
    // Flow is done since stats are being updated
    $('#gauge2 .gaugeNeedle').rotate({animateTo: 0});
    $('#gauge2 .gaugeGlass').rotate({animateTo: 0});
    var xAxis = new Array();
    var totalAmounts = new Array();
    var pours = new Array();

    var nameArr = $('#userName').html().split(' ');
    var name = nameArr[1] + ' ' + nameArr[2];

    for (var i = 0; i < data.data.length; i++) {
        var row = data.data[i];
        xAxis.push(row.name);
        totalAmounts.push(formatNumber(row.totalAmount, true));
        pours.push(formatNumber(row.pours, true));
    }
    currentKegPoursPerPersonCategories = xAxis;
    currentKegPoursPerPersonSeries = totalAmounts;

    initializeCharts();
}

function formatNumber(value, toRound) {
    var result = parseFloat(value);
    if (toRound) {
        result = Math.round(result);
    }
    return result;
}

function formatTime(time) {
    var hour = time.split(':')[0];
    var isPM = false;
    if (hour > 12) {
        hour -= 12;
        isPM = true;
    } else if (hour == 12) {
        isPM = true;
    } else if (hour == 0) {
        hour = 12;
    }

    hour += ':00';
    isPM ? hour += 'PM' : hour += 'AM';

    return hour;
}
