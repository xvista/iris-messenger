var User = require('../models/user');
var Group = require('../models/group');
var Message = require('../models/message');
module.exports = function (app){
    app.get('/test/create/user/:username/:password/:name', function (req, res) {
        User.findOne({ 'username': req.params.username }, function (err,user) {
            if(err){
                res.send(err);
            }
            if(user){
                res.send("User already exist");
            }
            else{
                var newUser = new User();
                newUser.username = req.params.username;
                newUser.password = req.params.password;
                nerUser.name = req.params.name;
                newUser.save(function (err) {
                    if(err){
                        res.send(err);
                    }
                    else{
                        res.send(newUser);
                    }
                });
            }
        });
    });
    app.get('/test/create/group/:username/:groupname', function (req, res) {
        Group.findOne({ 'name': req.params.groupname }, function (err, group) {
            if(err){
                res.send(err);
            }
            if(group){
                res.send("Group's name already exist");
            }
            else{
                var newGroup = new Group();
                newGroup.name = req.params.groupname;
                newGroup.save(function (err) {
                    if(err){
                        res.send(err);
                    }
                    else{
                        User.findOne({ 'username': req.params.username }, function (err, user) {
                            if(err){
                                res.send(err);
                            }
                            if(user){
                                newGroup.users.push(user);
                                newGroup.save(function (err) {
                                   if(err){
                                       res.send(err);
                                   }
                                   res.send(newGroup); 
                                });
                            }
                            else{
                                res.send("This user isn't exist");
                            }
                        });
                    }
                });
            }
        });
    });
    app.get('/test/create/message/:groupname/:username/:message', function (req, res) {
        Group.findOne({ 'name': req.params.groupname }, function (err, group) {
            if(err){
                res.send(err);
            }
            if(group){
                User.findOne({ 'username': req.params.username }, function (err, user) {
                    if(err){
                        res.send(err);
                    }
                    if(user){
                        var idx = group.users.indexOf(user._id);
                        if(idx == -1){
                            res.send(group);
                            res.send("This user isn't in this group");
                        }
                        else{
                            var message = new Message();
                            message.user = user;
                            message.text = req.params.message;
                            message.save(function (err) {
                                if(err){
                                    res.send(err);
                                }
                                group.messages.push(message);
                                group.save(function (err) {
                                    if(err){
                                        res.send(err);
                                    }
                                    res.send(group);
                                });
                            });
                        }
                    }
                    else{
                        res.send("This user isn't exist");
                    }
                });
            }
            else{
                res.send("This group isn't exist");
            }
        });
    });
    app.get('/test/get/message/:group', function (req, res) {
        Group.findOne({ 'name': req.params.group }, {name:1,users:1,messages:1,_id:0}, function (err, group) {
            if(err){
                res.send(err);
            }
            Message.find( { '_id': { $in: group.messages } }, {messageId:1,user:1,text:1,_id:0}, function(err, messages){
                if(err){
                    res.send(err);
                }
                var promises = messages.map(function(message){
                    return new Promise(function(resolve, reject){
                        User.findById( message.user, function(err, user){
                            if(err){
                                res.send(err);
                            }
                            console.log(user.username);
                            message.user = user;
                            resolve();
                        });
                    });
                });
                Promise.all(promises).then(function(){
                    group.messages = messages;
                    User.find( { '_id': { $in: group.users } }, {username:1,_id:0}, function(err, users){
                        if(err){
                            res.send(err);
                        }
                        group.users = users;
                        res.send(group);
                    }); 
                });
            });
        });
    });
}