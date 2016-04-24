var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Group = require('../models/group');
var Message = require('../models/message');
module.exports = function (app, passport) {
    app.get('/', function (req, res) {
		Group.find(function (err, groups) {
			if (req.query.groupName) {
				Group.findOne({ 'name': req.query.groupName }, { name: 1, users: 1, messages: 1 })
					.populate('messages', { user: 1, text: 1, createdAt: 1 })
					.populate('users', { name: 1 })
					.exec(function (err, group) {
						if (group) {
							var promises = group.messages.map(function (message) {
								return new Promise(function (resolve, reject) {
									Message.findById(message._id)
										.populate('user', { name: 1 })
										.exec(function (err, m) {
											message.user = m.user;
											resolve();
										});
								});
							});
							Promise.all(promises).then(function () {
								res.render('ui', { allGroup: groups.sort({ updatedAt: -1 }), groupName: req.query.groupName, messages: group.messages });
							});
						}
						else
							res.render('ui', { allGroup: groups.sort({ updatedAt: -1 }) });
					});
			}
			else
				res.render('ui', { allGroup: groups.sort({ updatedAt: -1 }) });
		});
    });
    router.post('/create/group', function (req, res) {
		if(req.user)
        	var username = req.user.username;
		else
			var username = null;
		Group.findOne({ 'name': req.body.new_group }, function (err, group) {
			if (group) {
				res.ajax({status:'already exist'});
			}
			else {
				var newGroup = new Group();
				newGroup.name = req.body.new_group;
				User.findOne({ 'username': username }, function (err, user) {
					if (user) {
						newGroup.users.push(user);
                        newGroup.save(function(err){
							user.groups.push(newGroup);
							user.save(function(err){
								res.ajax({status:'created'});
							});
						});
					}
					else
						res.ajax({status:'not login'});
				});
			}
		});
    });

    // join group
    router.get('/join/group/:group_name', function (req, res) {

        Group.findOne({ 'name': req.params.group_name }, function (err, group) {
			if (err) {

				res.send(err);
			}
			if (group) {
				User.findOne({ 'username': req.user.username }, function (err, user) {
					if (err) {
						res.send(err);
					}
					if (user) {
                        var idx = group.users.indexOf(user._id);
                        if (idx >= 0)
                            res.redirect('/group/' + group.name);

						group.users.push(user);
                        user.groups.push(group);
                        user.save(function (err) {
                            if (err) {
                                res.send(err);
                            }
                        });
						group.save(function (err) {
							if (err) {
								res.send(err);
							}
                            res.redirect('/group/' + group.name);
						});
					}
                    else {
                        res.send("User is not found.")
                    }
				});
			}
			else {
				res.send("Sorry. This group has been closed.");
			}
		});
    });

    //list user's group
    router.get('/getusergroup', function (req, res) {
		User.findOne({ 'username': req.user.username }, function (err, user) {
			if (err) {
				res.send(err);
			}
			if (user) {
				Group.find({ '_id': { $in: user.groups } }, { name: 1, _id: 0 }, function (err, groups) {
					user.groups = groups;
					res.send(user.groups);
				});
			}
		});
    });

    //list all group
    router.get('/getallgroup', function (req, res) {
		Group.find({}, { name: 1, _id: 0 }, function (err, groups) {
			res.send(groups);
		});
    });

    router.get('/group/:group_name', function (req, res) {
        console.log(req.params.group_name);
		Group.findOne({ 'name': req.params.group_name }, function (err, group) {
            if (err) {

                res.send(err);
            }
            if (group) {
                User.findOne({ 'username': req.user.username }, function (err, user) {
                    if (err) {
                        res.send(err);
                    }
                    if (user) {
                        var idx = group.users.indexOf(user._id);
                        if (idx >= 0)
                            res.render('chat', { user: user, group: group, message: group.messages });
                        else
                            res.send("User isn't exist in this group");
                    }
                    else {
                        res.send("User is not found.")
                    }
                });
            }
            else {
                res.send("Sorry. This group has been closed.");
			}
		});
	});
	// leave group
	router.get('/leave/group/:group_name', function (req, res) {
		Group.findOne({ 'name': req.params.group_name }, function (err, group) {
			if (err) {
				res.send(err);
			}
			if (group) {
				User.findOne({ 'name': req.user.name }, function (err, user) {
					if (err) {
						res.send(err);
					}
					if (user) {
						var idx = group.users.indexOf(user._id);
						group.users.splice(idx, 1);
						group.save(function (err) {
							if (err) {
								res.send(err);
							}
							res.send("Success! You have left group.");
						});
					}
				});
			}
		});
	});
	return router;
}
