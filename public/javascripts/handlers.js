socket.on('welcome', welcomeUser);
socket.on('denial', denyUser);
socket.on('flowUpdate', updateKegFlow);
socket.on('amountUpdate', updateKegAmount);
socket.on('temperatureUpdate', updateKegTemperature);
socket.on('kegUpdate', updateKeg);
socket.on('allTimePours', updateAllTimePours);

socket.emit('getAllTimePours');

google.load('visualization', '1', {packages:['gauge']});
google.setOnLoadCallback(drawChart);
var lastSeenKegAmount;
var tempData;
var flowData;
var amtData;
var tempChart;
var tempOptions = {width: 400, height: 120, redFrom: 42, redTo: 100,
            yellowFrom:0, yellowTo: 34, minorTicks: 5};
var flowChart;
var flowOptions = {width: 400, height: 120};
var amtChart;
var amtOptions = {width: 400, height: 120, redFrom: 0, redTo: 10,
            yellowFrom:10, yellowTo: 25, minorTicks: 5};


function drawChart() {
    tempChart = new google.visualization.Gauge(document.getElementById('temp_div'));
    tempData = new google.visualization.DataTable();
    tempData.addColumn('string', 'Label');
    tempData.addColumn('number', 'Value');
    tempData.addRows(1);
    tempData.setValue(0, 0, 'Temp');
    tempData.setValue(0, 1, 40);
    tempChart.draw(tempData, tempOptions);

    flowChart = new google.visualization.Gauge(document.getElementById('flow_div'));
    flowData = new google.visualization.DataTable();
    flowData.addColumn('string', 'Label');
    flowData.addColumn('number', 'Value');
    flowData.addRows(1);
    flowData.setValue(0, 0, 'Flow');
    flowData.setValue(0, 1, 0);
    flowChart.draw(flowData, flowOptions);

    amtChart = new google.visualization.Gauge(document.getElementById('amount_div'));
    amtData = new google.visualization.DataTable();
    amtData.addColumn('string', 'Label');
    amtData.addColumn('number', 'Value');
    amtData.addRows(1);
    amtData.setValue(0, 0, 'Amount');
    if(lastSeenKegAmount) {
        amtData.setValue(0, 1, lastSeenKegAmount);
    } else {
        amtData.setValue(0, 1, 100);
    }
    amtChart.draw(amtData, amtOptions);
}


function welcomeUser(data) {
    $('#user').replaceWith('<div id="user">Welcome ' + data.user.name + '</div>');
}

function denyUser(data) {
    $('#user').replaceWith('<div id="user">Sorry</div>');
}

function updateKegFlow(data) {
    if(flowData && flowChart) {
        flowData.setValue(0, 1, data.flow);
        flowChart.draw(flowData, flowOptions);
    }
}

function updateKegAmount(data) {
    if(amtData && amtChart) {
        amtData.setValue(0, 1, data.amount);
        amtChart.draw(amtData, amtOptions);
    }
}

function updateKegTemperature(data) {
    if(tempData && tempChart) {
        tempData.setValue(0, 1, parseFloat(parseFloat(data.temperature).toFixed(0)));
        tempChart.draw(tempData, tempOptions);
    }
}

function updateKeg(data) {
    lastSeenKegAmount = data.keg.amount;
    $('#keg_name').replaceWith("<div id='keg_name'>" + data.keg.name + "</div>");
    $('#keg_description').replaceWith("<div id='keg_description'>" + data.keg.description + "</div>");
    updateKegAmount(lastSeenKegAmount);
}

function updateAllTimePours(data) {

}
