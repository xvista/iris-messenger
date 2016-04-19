var express = require('express');
var app = express();
var path = require('path');
var port = 8081;

var mongoose = require('mongoose');
mongoose.connect("mongodb://localhost:27017/irisDB");

// Configuring Passport
var passport = require('passport');
var expressSession = require('express-session');
app.use(expressSession({secret: 'mySecretKey'}));
app.use(passport.initialize());
app.use(passport.session());

var server = app.listen(port, function () {
    console.log('Listening on port ' + port);
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(express.static('public'));

if (app.get('env') == 'development') {
    app.locals.pretty = true;
}

var fs = require ('fs');
fs.readdirSync('controllers').forEach(function(file) {
  if ( file[0] == '.' ) return;
  var routeName = file.substr(0, file.indexOf('.'));
  require('./controllers/' + routeName)(app);
});