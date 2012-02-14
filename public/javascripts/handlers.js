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

function startHandlers() {
    $('#welcomeUser').hide();
    $('#denyUser').hide();
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
    $('#userName').append("Name: " + data.user.firstName + ' ' + data.user.lastName);

    $('#userAffiliation').empty();
    $('#userAffiliation').append("Affiliation: " + data.user.affiliation);

    $('#userJoined').empty();
    $('#userJoined').append("Signed Up: " + data.user.joined);

    $('#userTotalPours').empty();
    $('#userTotalPours').append("Total Pours: " + data.user.totalPours);

    $('#userImage').empty();

    if(data.user.path !== undefined && data.user.path !== '') {
        $('#userImage').append('<img src="/images/users/' + data.user.path + '.png" />');
    }
}

function denyUser(data) {
    $('#denyUser').dialog('open');
    setTimeout(function() {
        $('#denyUser').dialog('close');
    }, 5000);
}

function updateKegFlow(data) {
    //alert("Flow: " + parseInt(data.flow.flow));
    var flow = parseInt(data.flow.flow);
    if(!isNaN(flow)) {
        $('#gauge2 .gaugeNeedle').rotate({animateTo: flow});
    }
}

function updateKegAmount(amount) {
    $('#kegAmount').empty();

    var kegAmount;
    if(amount.hasOwnProperty("amount")) {
        kegAmount = parseInt(amount.amount);
    } else {
        kegAmount = parseInt(amount);
    }
    $('#kegAmount').append(kegAmount + "oz");
}

/**
 * Takes in a temperature object with the following properties
 * temperature - number
 * @param data
 */
function updateKegTemperature(data) {
    var temp = parseInt(data.temp.temp);
    $('#gauge .gaugeNeedle').rotate({animateTo: temp});
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

/**
 * Takes in an object with the following properties
 * data - array of objects
 * data[*].name - string
 * data[*].totalAmount - number
 * @param data
 */
function updateAllTimePoursPerPerson(data) {
    var xAxis = new Array();
    var chartData = new Array();


    for (var i = 0; i < data.data.length; i++) {
        var row = data.data[i];
        xAxis.push(row.name);
        chartData.push(row.totalAmount);
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
    var xAxis = new Array();
    var chartData = new Array();


    for (var i = 0; i < data.data.length; i++) {
        var row = data.data[i];
        xAxis.push(formatTime(row.timePoured));
        chartData.push(row.totalAmount);
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
    var xAxis = new Array();
    var chartData = new Array();


    for (var i = 0; i < data.data.length; i++) {
        var row = data.data[i];
        xAxis.push(formatTime(row.timePoured));
        chartData.push(row.totalAmount);
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
    var xAxis = new Array();
    var chartData = new Array();


    for (var i = 0; i < data.data.length; i++) {
        var row = data.data[i];
        xAxis.push(row.name);
        chartData.push(row.totalAmount);
    }
    currentKegPoursPerPersonCategories = xAxis;
    currentKegPoursPerPersonSeries = chartData;

    initializeCharts();
}

function formatTime(time) {
    var hour = time.split(':')[0];
    var isPM = false;
    if(hour > 12) {
        hour -= 12;
        isPM = true;
    } else if(hour == 12) {
        isPM = true;
    }

    hour += ':00';
    isPM ? hour += 'PM' : hour += 'AM';

    return hour;
}
