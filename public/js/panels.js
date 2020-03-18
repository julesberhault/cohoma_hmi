// TABS machinery
$(function () {
    $('#tabs li:last-child a').tab('show')
})
$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
    e.target // newly activated tab
    e.relatedTarget // previous active tab
})

// WP List machinery
var el = document.getElementById('wayPointsList');

var sortable = Sortable.create(el, {
    onEnd: function (evt) {
        var itemEl = evt.item;  // dragged HTMLElement
        console.log(itemEl.id, evt.oldIndex, evt.newIndex)
    }
});

var currID = 5;

$(".deleteWP").click(function (event) {
    $(this).closest("li").remove();
});

$(".addWP").click(function (event) {
    $("#wayPointsList").append(
        '<li class="list-group-item" id="id'+ currID + '">Waypoint ' + currID + '<button class="btn btn-danger deleteWP" type="button">-</button></li>'
    );

    currID++;
    $(".deleteWP").click(function (event) {
        $(this).closest("li").remove();
    });
});

$(".submitWP").click(function (event) {
    var wp = [];
    $("#wayPointsList").each(function( index ) {
        console.log( index + ": " + $( this ).text() );
    });

    currID++;
    $(".deleteWP").click(function (event) {
        $(this).closest("li").remove();
    });
});

var compass = new RadialGauge({
    renderTo: 'compass',
    minValue: 0,
    maxValue: 360,
    majorTicks: [
        "N",
        "NE",
        "E",
        "SE",
        "S",
        "SW",
        "W",
        "NW",
        "N"
    ],
    minorTicks: 22,
    ticksAngle: 360,
    startAngle: 180,
    strokeTicks: false,
    highlights: false,
    colorPlate: "#222",
    colorMajorTicks: "#f5f5f5",
    colorMinorTicks: "#ddd",
    colorNumbers: "#ccc",
    colorNeedle: "rgba(240, 128, 128, 1)",
    colorNeedleEnd: "rgba(255, 160, 122, .9)",
    valueBox: false,
    valueTextShadow: false,
    colorCircleInner: "#fff",
    colorNeedleCircleOuter: "#ccc",
    needleCircleSize: 15,
    needleCircleOuter: false,
    animationRule: "linear",
    needleType: "line",
    needleStart: 75,
    needleEnd: 99,
    needleWidth: 3,
    borders: true,
    borderInnerWidth: 0,
    borderMiddleWidth: 0,
    //borderOuterWidth: 10,
    colorBorderOuter: "#ccc",
    colorBorderOuterEnd: "#ccc",
    colorNeedleShadowDown: "#222",
    borderShadowWidth: 0,
    animationDuration: 1500
}).draw();

var speed = new RadialGauge({
    renderTo: 'speed',
    //width: 300,
    //height: 300,
    units: "Km/h",
    minValue: 0,
    maxValue: 220,
    majorTicks: [
        "0",
        "20",
        "40",
        "60",
        "80",
        "100",
        "120",
        "140",
        "160",
        "180",
        "200",
        "220"
    ],
    minorTicks: 2,
    strokeTicks: true,
    highlights: [
        {
            "from": 160,
            "to": 220,
            "color": "rgba(200, 50, 50, .75)"
        }
    ],
    colorPlate: "#fff",
    borderShadowWidth: 0,
    borders: false,
    needleType: "arrow",
    needleWidth: 2,
    needleCircleSize: 7,
    needleCircleOuter: true,
    needleCircleInner: false,
    animationDuration: 1500,
    animationRule: "linear"
}).draw();