var express = require('express');
var router = express.Router();
module.exports = function (app, passport){
    app.get('/', function (req, res) {
        res.render('ui');
    });
    app.get('/chat',function (req, res){
        res.render('chat');
    });
    return router;
}