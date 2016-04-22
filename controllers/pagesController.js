var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Group = require('../models/group');
var Message = require('../models/message');
module.exports = function (app, passport){
    app.get('/', function (req, res) {
        res.render('ui');
    });

    router.get('/chat/:group_name', function(req, res){
		res.render('chat',{user:req.user,group:req.params.group_name});
	});
    //create new group and insert the user who requested 
    router.post('/create/group',function(req,res){
    	Group.findOne({'name':req.body.new_group},function(err,group){
    		if(err){

    			res.send(err);
    		}
    		if(group){
    			res.send("The group already exist")
    		}
    		else{
    			var newGroup = new Group();
    			newGroup.name = req.body.new_group;
    			User.findOne({'name':req.body.user_name},function(err,user){
    				console.log("error>>>>>>>>>>>>>>>>>>"+req.body.user_name);
					if(err){
						res.send(err);
					}
					if(user){
						newGroup.users.push(user);
						newGroup.save(function(err){
							if(err){
								res.send(err);
							}
							else{
								res.redirect('/chat/'+newGroup.name);
							}
						});
					}
					else{
						res.send("User not found");
					}
				});
    			newGroup.save(function(err){
    				if(err){
    					res.send(err);
    				}
    			});
    		}
    	});
    });
    // get all of group
    router.get('/get/allGroup',function(req,res){
    	Group.find(function(err,group){
    		if(err){
    			res.send(err);
    		}
    		res.send(group);
    	});
    });
    // join group
    router.post('/join/group/:group_name',function(req,res){
    	Group.findOne({'name':req.params.group_name},function(err,group){
    		if(err){
    			res.send(err);
    		}
    		if(group){
    			User.findOne({'name':req.user_name},function(err,user){
    				if(err){
    					res.send(err);
    				}
    				if(user){
    					group.users.push(user);
    					group.save(function(err){
    						if(err){
    							res.send(err);
    						}
    						res.send(group.messages);
    					});
    				}
    			});
    		}
    		else{
    			res.send("Sorry. This group has been closed.");
    		}
    	});
    });
    // leave group
    router.post('/leave/group/:group_name',function(req,res){
    	Group.findOne({'name':req.params.group_name},function(err,group){
    		if(err){
    			res.send(err);
    		}
    		if(group){
    			User.findOne({'name':req.user_name},function(err,user){
    				if(err){
    					res.send(err);
    				}
    				if(user){
    					group.users.pop(user);
    					group.save(function(err){
    						if(err){
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