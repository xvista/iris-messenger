var express = require('express');
var router = express.Router();
module.exports = function (app, passport){
    app.get('/', function (req, res) {
        res.render('ui');
    });
    return router;
}