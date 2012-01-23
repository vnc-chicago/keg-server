socket.on('welcome', welcomeUser);
socket.on('denial', denyUser);
socket.on('flowUpdate', updateKegFlow);
socket.on('amountUpdate', updateKegAmount);
socket.on('temperatureUpdate', updateKegTemperature);
socket.on('kegUpdate', updateKeg);
socket.on('allTimePoursPerPersonUpdate', updateAllTimePoursPerPerson);
socket.on('allTimePoursPerTimeUpdate', updateAllTimePoursPerTime);
socket.on('kegPoursPerPersonUpdate', updateKegPoursPerPerson);
socket.on('kegPoursPerTimeUpdate', updateKegPoursPerTime);

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
    parseInt(data.temperature);
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

/**
 * Takes in an object with the following properties
 * rows - array of objects
 * rows[*].name - string
 * rows[*].totalAmount - number
 * @param data
 */
function updateAllTimePoursPerPerson(data) {
    var xAxis = new Array();
    var chartData = new Array();


    for (var i = 0; i < data.rows.length; i++) {
        var row = data.rows[i];
        xAxis.push(row.name);
        chartData.push(row.totalAmount);
    }
    allTimePoursPerPersonCategories = xAxis;
    allTimePoursPerPersonSeries = chartData;

    initializeCharts();
}

/**
 * Takes in an object with the following properties
 * rows - array of objects
 * rows[*].timePoured - string 'HH:00:00'
 * rows[*].totalAmount - number
 * @param data
 */
function updateAllTimePoursPerTime(data) {
    var xAxis = new Array();
    var chartData = new Array();


    for (var i = 0; i < data.rows.length; i++) {
        var row = data.rows[i];
        xAxis.push(formatTime(row.timePoured));
        chartData.push(row.totalAmount);
    }
    allTimePoursPerTimeCategories = xAxis;
    allTimePoursPerTimeSeries = chartData;

    initializeCharts();
}

/**
 * Takes in an object with the following properties
 * rows - array of objects
 * rows[*].timePoured - string 'HH:00:00'
 * rows[*].totalAmount - number
 * @param data
 */
function updateKegPoursPerTime(data) {
    var xAxis = new Array();
    var chartData = new Array();


    for (var i = 0; i < data.rows.length; i++) {
        var row = data.rows[i];
        xAxis.push(formatTime(row.timePoured));
        chartData.push(row.totalAmount);
    }
    currentKegPoursPerTimeCategories = xAxis;
    currentKegPoursPerTimeSeries = chartData;

    initializeCharts();
}

/**
 * Takes in an object with the following properties
 * rows - array of objects
 * rows[*].name - string
 * rows[*].totalAmount - number
 * @param data
 */
function updateKegPoursPerPerson(data) {
    var xAxis = new Array();
    var chartData = new Array();


    for (var i = 0; i < data.rows.length; i++) {
        var row = data.rows[i];
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
