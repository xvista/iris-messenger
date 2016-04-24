var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Group = require('../models/group');
var Message = require('../models/message');
module.exports = function (app, passport) {
    router.get('/', function (req, res) {
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
										.populate('user')
										.exec(function (err, m) {
											message.user = m.user;
											resolve();
										});
								});
							});
							var joinedStatus = false;
							Promise.all(promises).then(function () {
								var promiese2 = group.users.map(function (user) {
									return new Promise(function (resolve, reject) {
										if (user._id + '' == req.user._id + '')
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
		if (!req.user)
			res.redirect('/login');
		else
			Group.findOne({ 'name': req.body.group_name }, function (err, group) {
				if (group) {
					var idx = group.users.indexOf(req.user._id);
					if (idx >= 0)
						res.redirect('/?groupName=' + req.body.group_name);
					else {
						group.users.push(req.user._id);
						group.save(function (err) {
							req.user.groups.push(group);
							req.user.save(function (err) {
								res.redirect('/?groupName=' + req.body.group_name);
							});
						});
					}
				}
				else
					res.redirect('/');
			});
    });
	router.get('/leave/group/', function (req, res) {
		if (!req.user)
			res.redirect('/login');
		Group.findOne({ 'name': req.query.group_name }, function (err, group) {
			if (group) {
				var idx = group.users.indexOf(req.user._id);
				group.users.splice(idx, 1);
				group.save(function (err) {
					res.redirect('/?groupName=' + req.query.group_name);
				});
			}
			else
				res.redirect('/');
		});
	});
	router.post('/send/message', function (req, res) {
		if (!req.user)
			res.send({ 'status': 'not login' });
		Group.findOne({ 'name': req.body.groupName }, function (err, group) {
			if (group) {
				var m = new Message();
				m.user = req.user;
				m.text = req.body.message;
				m.save(function (err) {
					group.messages.push(m);
					group.save(function (err) {
						res.send({ 'status': 'ok', 'user': req.user, 'message': m });
					});
				});
			}
			else
				res.send({ 'status': 'group not exist' });
		});
	});
	return router;
}
