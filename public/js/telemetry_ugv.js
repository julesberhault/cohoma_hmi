// Drawing Gauges
var compass = new RadialGauge({
    renderTo: 'compass',
    width: 150,
    height: 140,
    minValue: 0,
    maxValue: 360,
    animationTarget: "plate",
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
    minorTicks: 9,
    ticksAngle: 360,
    startAngle: 180,
    strokeTicks: false,
    highlights: false,
    colorPlate: "#272727",
    colorPlateEnd: "#171717",
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
    borderInnerWidth: 2,
    borderMiddleWidth: 3,
    borderOuterWidth: 2,
    colorBorderOuter: "#ccc",
    colorBorderOuterEnd: "#ccc",
    colorNeedleShadowDown: "#222",
    borderShadowWidth: 0,
    useMinPath: true,
    animationDuration: 20
}).draw();

var velocity = new RadialGauge({
    renderTo: 'velocity',
    width: 150,
    height: 140,
    minValue: 0,
    maxValue: 14,
    title:"Vitesse",
    colorTitle: "#666",
    units: "km/h",
    colorUnits: "#666",
    colorMajorTicks: "#666",
    colorMinorTicks: "#777",
    minValue: 0,
    maxValue: 14,
    ticksAngle: 270,
    startAngle: 45,
    majorTicks: [
        "0",
        "2",
        "4",
        "6",
        "8",
        "10",
        "12",
        "14"
    ],
    minorTicks: 4,
    strokeTicks: true,
    highlights: [
        {
            "from": 11,
            "to": 14,
            "color": "#bbb"
        }
    ],
    colorPlate: "#fff",
    colorPlateEnd: "#eee",
    borderShadowWidth: 0,
    borders: true,
    needleType: "arrow",
    needleWidth: 2,
    valueBox: true,
    valueInt: 2,
    valueDec: 1,
    needleCircleSize: 10,
    needleCircleOuter: true,
    needleCircleInner: false,
    borders: true,
    borderInnerWidth: 2,
    borderMiddleWidth: 3,
    borderOuterWidth: 2,
    colorBorderOuter: "#ccc",
    animation: false
}).draw();

var refreshCompass = function(heading)
{
    // Heading angle in degrees going from -180° to 180°
    if (heading < 0.0) { compass.value = 360.0+heading; }
    else { compass.value = heading; }
}