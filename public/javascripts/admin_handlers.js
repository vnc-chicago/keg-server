$('#promptForCard').dialog({ autoOpen: false });
$('#promptForSmile').dialog({ autoOpen: false });
$('#createSuccess').dialog({ autoOpen: false });
$('#createFailure').dialog({ autoOpen: false });

socket.on('promptForCard', function() {
    $('#promptForCard').dialog('open');

    setTimeout(function() {
        $('#promptForCard').dialog('close');
    }, 5000);
});

socket.on('promptForPic', function() {
    $('#promptForSmile').dialog('open');

    var i = 3;
    setInterval(function() {
        $('p #count').empty();
        $('p #count').append(i);
        i = i - 1;
    }, 1000);

    setTimeout(function() {
        $('#promptForSmile').dialog('close');
    }, 5000);
});

socket.on('createSuccess', function() {
    $('#createSuccess').dialog('open');

    setTimeout(function() {
        $('#createSuccess').dialog('close');
    }, 5000);
});

socket.on('createFailure', function(data) {
    $('#error').replaceWith("<p id='error'>" + data.error + "</p>")
    $('#createFailure').dialog('open');

    setTimeout(function() {
        $('#createFailure').dialog('close');
    }, 5000);
});