var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Group = require('../models/group');
var Message = require('../models/message');
module.exports = function (app, passport) {
    app.get('/', function (req, res) {
		if (!req.user)
			res.redirect('login');
		Group.find(function (err, groups) {
			if (req.query.groupName) {
				Group.findOne({ 'name': req.query.groupName }, { name: 1, users: 1, messages: 1 })
					.populate('messages', { user: 1, text: 1, createdAt: 1 })
					.populate('users', { name: 1 })
					.sort({ 'updatedAt': -1 })
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
							var joinedStatus = false;
							Promise.all(promises).then(function () {
								// console.log(groups);
								var promiese2 = group.users.map(function (user) {
									return new Promise(function (resolve, reject) {
										if (user._id+'' == req.user._id+'')
											joinedStatus = true;
										resolve();
									});
								});
								Promise.all(promiese2).then(function () {
									res.render('ui', { allGroup: groups, groupName: req.query.groupName, messages: group.messages, joinedStatus: joinedStatus, user: req.user });
								});
							});
						}
						else
							res.render('ui', { allGroup: groups, user: req.user });
					});
			}
			else
				res.render('ui', { allGroup: groups, user: req.user });
		});
    });
    router.post('/create/group', function (req, res) {
		if (req.user)
			var username = req.user.username;
		else
			var username = null;
		Group.findOne({ 'name': req.body.new_group }, function (err, group) {
			if (group) {
				res.send({ status: 'already exist' });
			}
			else {
				var newGroup = new Group();
				newGroup.name = req.body.new_group;
				User.findOne({ 'username': username }, function (err, user) {
					if (user) {
						newGroup.users.push(user);
                        newGroup.save(function (err) {
							user.groups.push(newGroup);
							user.save(function (err) {
								res.send({ status: 'created' });
							});
						});
					}
					else
						res.send({ status: 'not login' });
				});
			}
		});
    });
    router.post('/join/group', function (req, res) {
		if(!req.user)
			res.redirect('/login');
		else
			Group.findOne({ 'name': req.body.group_name }, function (err, group) {
				if (group) {
					var idx = group.users.indexOf(req.user._id);
					if (idx >= 0)
						res.redirect('/?groupName='+req.body.group_name);
					else{
						group.users.push(req.user._id);
						group.save(function (err) {
							user.groups.push(group);
							user.save(function (err) {
								res.redirect('/?groupName='+req.body.group_name);
							});
						});
					}
				}
				else
					res.redirect('/');
			});
    });
	router.post('/leave/group/', function (req, res) {
		if(!req.user)
			res.redirect('/');
		Group.findOne({ 'name': req.body.group_name }, function (err, group) {
			if (group) {
				var idx = group.users.indexOf(req.user._id);
				group.users.splice(idx, 1);
				group.save(function (err) {
					res.redirect('/');
				});
			}
			else
				res.redirect('/');
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
	return router;
}
