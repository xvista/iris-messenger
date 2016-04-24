var express = require('express');
var app = express();
var path = require('path');
var port = 8081;

var mongoose = require('mongoose');
var Message = require('./models/message.js');
var Group =require('./models/group.js');

mongoose.connect("mongodb://localhost:27017/irisDB");

var server = app.listen(port, function () {
    console.log('Listening on port ' + port);
});

var io = require('socket.io').listen(server);
io.on('connection',function(socket){
    socket.on('subscribe', function(group) { 
        console.log('joining group', group);
        socket.join(group); 
    });

    socket.on('unsubscribe', function(group) {  
        console.log('leaving group', group);
        socket.leave(group); 
    });

    socket.on('send', function(data) {
        console.log('sending message');
        console.log(data);
        io.sockets.in(data.group).emit('chat', { 'user':data.user, 'message':data.message });
    });
});

// Configuring Passport
var passport = require('passport');
var expressSession = require('express-session');
// TODO - Why Do we need this key ?
app.use(expressSession({secret: 'mySecretKey', resave: true, saveUninitialized: true}));
app.use(passport.initialize());
app.use(passport.session());

 // Using the flash middleware provided by connect-flash to store messages in session
 // and displaying in templates
var flash = require('connect-flash');
app.use(flash());

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Initialize Passport
var initPassport = require('./passport/init');
initPassport(passport);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(express.static('public'));

if (app.get('env') == 'development') {
    app.locals.pretty = true;
}

// var routes = require('./controllers/authController')(passport);
// app.use('/', routes);
var fs = require ('fs');
fs.readdirSync('controllers').forEach(function(file) {
  if ( file[0] == '.' ) return;
  var routeName = file.substr(0, file.indexOf('.'));
  var routes = require('./controllers/' + routeName)(app, passport);
  app.use('/', routes);
});



module.exports = app;