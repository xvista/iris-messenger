var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Group = require('../models/group');
var Message = require('../models/message');
module.exports = function (app, passport){
    app.get('/', function (req, res) {
        res.render('ui');
    });
    //join group
    router.get('/chat/:group_name', function(req, res){
        Group.findOne({'name':req.params.group_name},function(err,group){
            if(err){
                res.send(err);
            }
            if(group){
                res.render('chat',{user:req.user.username,group:req.params.group_name,group_message:group.messages});
            }
            else{
                res.send("The group is not exist.")
            }
        });
	});
    //create new group and insert the user who requested 
    router.post('/create/group',function(req,res){
        var username = req.user.username;
        console.log("USERNAME:",username);
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
    			User.findOne({'name':req.user.user_name},function(err,user){
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
    
    // join group
    router.post('/join/group/:group_name',function(req,res){
    	Group.findOne({'name':req.params.group_name},function(err,group){
    		if(err){
    			res.send(err);
    		}
    		if(group){
    			User.findOne({'name':req.user.user_name},function(err,user){
    				if(err){
    					res.send(err);
    				}
    				if(user){
    					group.users.push(user);
    					group.save(function(err){
    						if(err){
    							res.send(err);
    						}
    						res.redirect('/chat/'+group.name,{group:group,message:group.messages});
    					});
    				}
                    else{
                        res.send("User is not found.")
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