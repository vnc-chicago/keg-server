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

var charts = [showCurrentKegPoursPerPerson, showCurrentKegPoursPerTime, showAllTimePoursPerPerson, showAllTimePoursPerTime];
var currentChart = 0;
var currentChartDisplay;
var chartsInitialized = false;
var chartWidth = 460;
const ROTATE_INTERVAL = 15000;

var currentKegPoursPerTime;
var currentKegPoursPerPerson;
var allTimePoursPerTime;
var allTimePoursPerPerson;

var currentKegPoursPerTimeCategories;
var currentKegPoursPerPersonCategories;
var allTimePoursPerTimeCategories;
var allTimePoursPerPersonCategories;

var currentKegPoursPerTimeSeries;
var currentKegPoursPerPersonSeries;
var allTimePoursPerTimeSeries;
var allTimePoursPerPersonSeries;

const PARTITION_SIZE = 15;

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
    $('#welcomeUser').append("<p>Welcome " + data.user.firstName + ' ' + data.user.lastName + "</p>");

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
    $('#userTotalPours').append('<p>Total Pours: <span id="pours">' + data.user.totalPours + '</span></p>');

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
        if (path !== '') {
            var div = '<div><img src="/images/fluid/achievements/' + path + '.png" />' + achievements[achievement].description + '</div>';
            $('.slideshow').append(div);
        } else {
            $('.slideshow').append(label);
        }
    }
    $('.slideshow').cycle({
        fx: 'fade' // choose your transition type, ex: fade, scrollUp, shuffle, etc...
    });

}

function denyUser() {
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
    $('#kegImage').append('<img id="brewerImage" src="/images/fluid/brewers/' + data.keg.brewer.replace(' ', '') + '.png" alt="' + data.keg.brewer + '" />');
    $('#brewerImage').error(function() {
        $(this).hide();
    });


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

    // Update pour amount
    $('#pours').html(parseInt($('#pours').html()) + 1);


    $('#newAchievements').empty();
    var hasNewAchievements = false;
    for (var achievement in data.achievements) {
        hasNewAchievements = true;
        var label = '<p>' + data.achievements[achievement].name + ': ' + data.achievements[achievement].description + '</p>';
        var path = data.achievements[achievement].path;
        if (path !== '') {
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
    var xAxis = new Array();
    var chartData = new Array();

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
    var xAxis = new Array();
    var totalAmounts = new Array();
    var pours = new Array();

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

function startCharts() {
    setTheme();
    chartWidth = $('#chart').width();
    $(window).resize(function() {
        chartWidth = $('#chart').width();
        resizeChart();
    });

    // Chart left nav button functionality.
    $('.buttonLeftOff').hover(function() {
        $(this).removeClass('buttonLeftOff').addClass('buttonLeftOn');
    });

    $('.buttonLeftOff').mouseout(function() {
        $(this).removeClass('buttonLeftOn').addClass('buttonLeftOff');
    });

    $('.buttonLeftOff').click(function() {
        rotateCharts(false);
    });

    // Chart right nav button functionality.
    $('.buttonRightOff').hover(function() {
        $(this).toggleClass('buttonRightOn');
    });

    $('.buttonRightOff').click(function() {
        rotateCharts(true);
    });
}


function initializeCharts() {
    if (!chartsInitialized) {
        chartsInitialized = true;
        $('#chart').fadeOut(charts[currentChart]);
        window.setInterval(function() {
            rotateCharts(true);
        }, ROTATE_INTERVAL);
    }
}

function rotateCharts(isForward) {
    if (currentChartDisplay) {
        var extremes = currentChartDisplay.xAxis[0].getExtremes();

        if (extremes.dataMax + .5 >= extremes.max + PARTITION_SIZE && isForward) {
            currentChartDisplay.xAxis[0].setExtremes(extremes.min + PARTITION_SIZE + .5, Math.min(extremes.max + PARTITION_SIZE + .5, extremes.dataMax));
        } else if(extremes.dataMin - .5 <= extremes.min - PARTITION_SIZE && !isForward) {
            currentChartDisplay.xAxis[0].setExtremes(Math.max(extremes.min - PARTITION_SIZE - .5, 0), extremes.max - PARTITION_SIZE - .5);
        } else if (isForward) {
            if (currentChart == charts.length - 1) {
                currentChart = 0;
            } else {
                currentChart++;
            }
            $('#chart').fadeOut(charts[currentChart]);
        } else {
            if (currentChart == 0) {
                currentChart = charts.length - 1;
            } else {
                currentChart--;
            }
            $('#chart').fadeOut(charts[currentChart]);
        }
    }
}

function showCurrentKegPoursPerPerson() {
    currentChartDisplay = currentKegPoursPerPerson = new Highcharts.Chart({
        chart : {
            renderTo : 'chart',
            type : 'column',
            width : chartWidth
        },
        title : {
            text : 'Current Keg Pour Amounts Per Person'
        },
        xAxis : {
            categories : currentKegPoursPerPersonCategories,
            labels : { rotation: -45, align: 'right' },
            min : 0,
            max : Math.min(PARTITION_SIZE, currentKegPoursPerPersonCategories.length - 1)
        },
        yAxis : {
            title : {
                text : 'Pour Amount'
            },
            allowDecimals : false
        },
        series : [
            {
                data : currentKegPoursPerPersonSeries
            }
        ],
        tooltip : { formatter : function() {
            return this.x + ': ' + this.y + 'oz';
        }
        },
        credits : {
            enabled : false
        },
        legend : {
            enabled : false
        }
    });

    $('#chart').fadeIn(function() {
        resizeChart(currentKegPoursPerPerson);
    });
}

function showCurrentKegPoursPerTime() {
    currentChartDisplay = currentKegPoursPerTime = new Highcharts.Chart({
        chart : {
            renderTo : 'chart',
            defaultSeriesType : 'line',
            width : chartWidth
        },
        title : {
            text : 'Current Keg Pour Amounts Per Time'
        },
        xAxis : {
            categories : currentKegPoursPerTimeCategories,
            min : 0,
            max : Math.min(PARTITION_SIZE, currentKegPoursPerTimeCategories.length - 1)
        },
        yAxis : {
            title : {
                text : 'Pour Amount'
            },
            allowDecimals : false
        },
        series : [
            {
                data : currentKegPoursPerTimeSeries
            }
        ],
        tooltip : { formatter : function() {
            return this.x + ': ' + this.y + 'oz';
        }
        },
        credits : {
            enabled : false
        },
        legend : {
            enabled : false
        }
    });

    $('#chart').fadeIn(function() {
        resizeChart(currentKegPoursPerTime);
    });
}

function showAllTimePoursPerPerson() {
    currentChartDisplay = allTimePoursPerPerson = new Highcharts.Chart({
        chart : {
            renderTo : 'chart',
            type : 'column',
            width : chartWidth
        },
        title : {
            text : 'All Time Pour Amounts Per Person'
        },
        xAxis : {
            categories : allTimePoursPerPersonCategories,
            labels : { rotation: -45, align: 'right' },
            min : 0,
            max : Math.min(PARTITION_SIZE, allTimePoursPerPersonCategories.length - 1)
        },
        yAxis : {
            title : {
                text : 'Pour Amount'
            },
            allowDecimals : false
        },
        series : [
            {
                data : allTimePoursPerPersonSeries
            }
        ],
        tooltip : { formatter : function() {
            return this.x + ': ' + this.y + 'oz';
        }
        },
        credits : {
            enabled : false
        },
        legend : {
            enabled : false
        }
    });

    $('#chart').fadeIn(function() {
        resizeChart(allTimePoursPerPerson);
    });
}

function showAllTimePoursPerTime() {
    currentChartDisplay = allTimePoursPerTime = new Highcharts.Chart({
        chart : {
            renderTo : 'chart',
            defaultSeriesType : 'line',
            width : chartWidth
        },
        title : {
            text : 'All Time Pour Amounts Per Time'
        },
        xAxis : {
            categories : allTimePoursPerTimeCategories,
            min : 0,
            max : Math.min(PARTITION_SIZE, allTimePoursPerTimeCategories.length - 1)
        },
        yAxis : {
            title : {
                text : 'Pour Amount'
            },
            allowDecimals : false
        },
        series : [
            {
                data : allTimePoursPerTimeSeries
            }
        ],
        tooltip : { formatter : function() {
            return this.x + ': ' + this.y + 'oz';
        }
        },
        credits : {
            enabled : false
        },
        legend : {
            enabled : false
        }
    });

    $('#chart').fadeIn(function() {
        resizeChart(allTimePoursPerTime);
    });
}

function resizeChart(chart) {
    if (typeof chart === 'undefined') {
        chart = currentChartDisplay;
    }
    chart.setSize($('#chart').width(), $('#chart').height(), true);
    chart.redraw();
}

/** * Gray theme for Highcharts JS * @author Torstein Hønsi */
function setTheme() {
    Highcharts.theme = {
        colors : ["#DDDF0D", "#7798BF", "#55BF3B", "#DF5353", "#aaeeee", "#ff0066", "#eeaaee", "#55BF3B", "#DF5353", "#7798BF", "#aaeeee"],
        chart : {
            backgroundColor : {
                linearGradient : [0, 0, 0, 400],
                stops : [
                    [0, 'rgb(96, 96, 96)'],
                    [1, 'rgb(16, 16, 16)']
                ]
            },
            borderWidth : 0,
            borderRadius : 15,
            plotBackgroundColor : null,
            plotShadow : false,
            plotBorderWidth : 0
        },
        title : {
            style : {
                color : '#FFF',
                font : '16px Lucida Grande, Lucida Sans Unicode, Verdana, Arial, Helvetica, sans-serif'
            }
        },
        subtitle : {
            style : {
                color : '#DDD',
                font : '12px Lucida Grande, Lucida Sans Unicode, Verdana, Arial, Helvetica, sans-serif'
            }
        },
        xAxis : {
            gridLineWidth : 0,
            lineColor : '#999',
            tickColor : '#999',
            labels : {
                style : {
                    color : '#999',
                    fontWeight : 'bold'
                }
            },
            title : {
                style : {
                    color : '#AAA',
                    font : 'bold 12px Lucida Grande, Lucida Sans Unicode, Verdana, Arial, Helvetica, sans-serif'
                }
            }
        },
        yAxis : {
            alternateGridColor : null,
            minorTickInterval : null,
            gridLineColor : 'rgba(255, 255, 255, .1)',
            lineWidth : 0,
            tickWidth : 0,
            labels : {
                style : {
                    color : '#999',
                    fontWeight : 'bold'
                }
            },
            title : {
                style : {
                    color : '#AAA',
                    font : 'bold 12px Lucida Grande, Lucida Sans Unicode, Verdana, Arial, Helvetica, sans-serif'
                }
            }
        },
        legend : {
            itemStyle : {
                color : '#CCC'
            },
            itemHoverStyle : {
                color : '#FFF'
            },
            itemHiddenStyle : {
                color : '#333'
            }
        },
        labels : {
            style : {
                color : '#CCC'
            }
        },
        tooltip : {
            backgroundColor : {
                linearGradient : [0, 0, 0, 50],
                stops : [
                    [0, 'rgba(96, 96, 96, .8)'],
                    [1, 'rgba(16, 16, 16, .8)']
                ]
            },
            borderWidth : 0,
            style : {
                color : '#FFF'
            }
        },
        plotOptions : {
            line : {
                dataLabels : {
                    color : '#CCC'
                },
                marker : {
                    lineColor : '#333'
                }
            },
            spline : {
                marker : {
                    lineColor : '#333'
                }
            },
            scatter : {
                marker : {
                    lineColor : '#333'
                }
            },
            candlestick : {
                lineColor : 'white'
            }
        },
        toolbar : {
            itemStyle : {
                color : '#CCC'
            }
        },
        navigation : {
            buttonOptions : {
                backgroundColor : {
                    linearGradient : [0, 0, 0, 20],
                    stops : [
                        [0.4, '#606060'],
                        [0.6, '#333333']
                    ]
                },
                borderColor : '#000000',
                symbolStroke : '#C0C0C0',
                hoverSymbolStroke : '#FFFFFF'
            }
        },
        exporting : {
            buttons : {
                exportButton : {
                    symbolFill : '#55BE3B'
                },
                printButton : {
                    symbolFill : '#7797BE'
                }
            }
        },
        // scroll charts
        rangeSelector : {
            buttonTheme : {
                fill : {
                    linearGradient : [0, 0, 0, 20],
                    stops : [
                        [0.4, '#888'],
                        [0.6, '#555']
                    ]
                },
                stroke : '#000000',
                style : {
                    color : '#CCC',
                    fontWeight : 'bold'
                },
                states : {
                    hover : {
                        fill : {
                            linearGradient : [0, 0, 0, 20],
                            stops : [
                                [0.4, '#BBB'],
                                [0.6, '#888']
                            ]
                        },
                        stroke : '#000000',
                        style : {
                            color : 'white'
                        }
                    },
                    select : {
                        fill : {
                            linearGradient : [0, 0, 0, 20],
                            stops : [
                                [0.1, '#000'],
                                [0.3, '#333']
                            ]
                        },
                        stroke : '#000000',
                        style : {
                            color : 'yellow'
                        }
                    }
                }
            },
            inputStyle : {
                backgroundColor : '#333',
                color : 'silver'
            },
            labelStyle : {
                color : 'silver'
            }
        },
        navigator : {
            handles : {
                backgroundColor : '#666',
                borderColor : '#AAA'
            },
            outlineColor : '#CCC',
            maskFill : 'rgba(16, 16, 16, 0.5)',
            series : {
                color : '#7798BF',
                lineColor : '#A6C7ED'
            }
        },
        scrollbar : {

            barBackgroundColor : {
                linearGradient : [0, 0, 0, 20],
                stops : [
                    [0.4, '#888'],
                    [0.6, '#555']
                ]
            },
            barBorderColor : '#CCC',
            buttonArrowColor : '#CCC',
            buttonBackgroundColor : {
                linearGradient : [0, 0, 0, 20],
                stops : [
                    [0.4, '#888'],
                    [0.6, '#555']
                ]            },
            buttonBorderColor : '#CCC',
            rifleColor : '#FFF',
            trackBackgroundColor : {
                linearGradient : [0, 0, 0, 10],
                stops : [
                    [0, '#000'],
                    [1, '#333']
                ]
            },
            trackBorderColor : '#666'
        }
    };
    // Apply the theme
    Highcharts.setOptions(Highcharts.theme);
}