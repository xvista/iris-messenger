var express = require('express');
var app = express();
var path = require('path');
var port = 8081;

var server = app.listen(port, function () {
    console.log('Listening on port ' + port);
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(express.static('public'));

if (app.get('env') == 'development') {
    app.locals.pretty = true;
}

app.get('/', function (req, res) {
    res.render('index');
});