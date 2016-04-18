var User = require('../models/user');
module.exports = function (app){
    app.get('/', function (req, res) {
        res.render('index');
    });
    app.get('/test/create/user',function (req, res) {
        User.findOne({ 'username': "test" },function (err,user) {
            if(err){
                res.send(err);
            }
            if(user){
                res.send("already exist");
            }
            else{
                var newUser = new User();
                newUser.username = "test";
                newUser.password = "123";
                newUser.save(function (err) {
                    if(err){
                        res.send(err);
                    }
                    else{
                        res.send('User created');
                    }
                });
            }
        });
    });
}