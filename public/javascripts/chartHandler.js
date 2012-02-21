var charts = [showCurrentKegPoursPerPerson, showCurrentKegPoursPerTime, showAllTimePoursPerPerson, showAllTimePoursPerTime];
var currentChart = 0;
var currentChartDisplay;
var chartsInitialized = false;
var chartWidth = 460;
var ROTATE_INTERVAL = 15000;

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

function startCharts() {
    setTheme();
    chartWidth = $('#chartSection').width();
    $(window).resize(function() {
        chartWidth = $('#chartSection').width();
        resizeChart();
    });
}

function initializeCharts() {
    if(!chartsInitialized) {
        chartsInitialized = true;
        $('#chartSection').fadeOut(charts[currentChart]);
        window.setInterval(rotateCharts, ROTATE_INTERVAL);
    }
}

function rotateCharts() {
    if (currentChart == charts.length - 1) {
        currentChart = 0;
    } else {
        currentChart++;
    }
    $('#chartSection').fadeOut(charts[currentChart]);
}

function showCurrentKegPoursPerPerson() {
    currentChartDisplay = currentKegPoursPerPerson = new Highcharts.Chart({
        chart : {
            renderTo : 'chartSection',
            type : 'column',
            width : chartWidth
        },
        title : {
            text : 'Current Keg Pour Amounts Per Person'
        },
        xAxis : {
            categories : currentKegPoursPerPersonCategories
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
    $('#chartSection').fadeIn(function() {
        resizeChart(currentKegPoursPerPerson);
    });
}

function showCurrentKegPoursPerTime() {
    currentChartDisplay = currentKegPoursPerTime = new Highcharts.Chart({
        chart : {
            renderTo : 'chartSection',
            defaultSeriesType : 'line',
            width : chartWidth
        },
        title : {
            text : 'Current Keg Pour Amounts Per Time'
        },
        xAxis : {
            categories : currentKegPoursPerTimeCategories
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
    $('#chartSection').fadeIn(function() {
        resizeChart(currentKegPoursPerTime);
    });
}

function showAllTimePoursPerPerson() {
    currentChartDisplay = allTimePoursPerPerson = new Highcharts.Chart({
        chart : {
            renderTo : 'chartSection',
            type : 'column',
            width : chartWidth
        },
        title : {
            text : 'All Time Pour Amounts Per Person'
        },
        xAxis : {
            categories : allTimePoursPerPersonCategories
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
    $('#chartSection').fadeIn(function() {
        resizeChart(allTimePoursPerPerson);
    });
}

function showAllTimePoursPerTime() {
    currentChartDisplay = allTimePoursPerTime = new Highcharts.Chart({
        chart : {
            renderTo : 'chartSection',
            defaultSeriesType : 'line',
            width : chartWidth
        },
        title : {
            text : 'All Time Pour Amounts Per Time'
        },
        xAxis : {
            categories : allTimePoursPerTimeCategories
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
    $('#chartSection').fadeIn(function() {
        resizeChart(allTimePoursPerTime);
    });
}

function resizeChart(chart) {
    if(typeof chart === 'undefined') {
        chart = currentChartDisplay;
    }
    chart.setSize($('#chartSection').width(), $('#chartSection').height(), true);
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
                fill : {                    linearGradient : [0, 0, 0, 20],                    stops : [
                    [0.4, '#888'],
                    [0.6, '#555']
                ]                },
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
                            ]                        },
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
