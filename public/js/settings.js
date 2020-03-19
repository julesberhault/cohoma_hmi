$("#navSettings").addClass("active")

var settings = [];

socket.on("yourSettings", function (data) {
    settings = data;
    settings.forEach(s => {
        $(".settings").append(
            '<li class="list-group-item container">\
            <div class="row">\
                <div class="col-md-9">\
                    <p class="text-primary">' + s.variable + '</p>\
                    <p class="text-secondary">' + s.description + '</p>\
                </div>\
                <div class="col-md-3">\
                    <input class="text inputSetting form-control my-4" value="' + s.value + '">\
                </div>\
            </div>\
        </li>'
        )
    });
})

socket.emit("gimmeSettings");