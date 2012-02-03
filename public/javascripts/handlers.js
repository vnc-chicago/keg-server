socket.on('welcome', welcomeUser);
socket.on('denial', denyUser);
socket.on('flowUpdate', updateKegFlow);
socket.on('amountUpdate', updateKegAmount);
socket.on('temperatureUpdate', updateKegTemperature);
socket.on('kegUpdate', updateKeg);
socket.on('lastUserUpdate', updateLastUser);
socket.on('allTimePoursPerPersonUpdate', updateAllTimePoursPerPerson);
socket.on('allTimePoursPerTimeUpdate', updateAllTimePoursPerTime);
socket.on('kegPoursPerPersonUpdate', updateKegPoursPerPerson);
socket.on('kegPoursPerTimeUpdate', updateKegPoursPerTime);

var lastTemp = 0;

function welcomeUser(data) {
    $('#user').replaceWith('<div id="user">Welcome ' + data.user.name + '</div>');
}

function denyUser(data) {
    $('#user').replaceWith('<div id="user">Sorry</div>');
}

function updateKegFlow(data) {
    parseInt(data.flow);
}

function updateKegAmount(amount) {
    parseInt(amount);
}

/**
 * Takes in a temperature object with the following properties
 * temperature - number
 * @param data
 */
function updateKegTemperature(data) {
    var temp = parseInt(data.temp.temp);
    var rotation = 0;
    if(lastTemp = 0) {
        rotation = temp;
    } else {
        rotation = lastTemp - temp;
    }

    $('#gauge .gaugeNeedle').rotate({
        rotate: rotation
    });
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
    $('#keg_name').replaceWith("<div id='keg_name'>" + data.keg.name + "</div>");
    $('#keg_description').replaceWith("<div id='keg_description'>" + data.keg.description + "</div>");
    updateKegAmount(data.keg.amount);
}

function updateLastUser(data) {
    welcomeUser(data);
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
