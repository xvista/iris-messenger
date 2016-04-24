var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Group = require('../models/group');
var Message = require('../models/message');
module.exports = function (app, passport){
    app.get('/', function (req, res) {
        res.render('ui');
    });
 //    //join group
 //    router.get('/chat/:group_name', function(req, res){
 //        Group.findOne({'name':req.params.group_name},function(err,group){
 //            if(err){
 //                res.send(err);
 //            }
 //            if(group){
 //                res.render('chat',{user:req.user.username,group:req.params.group_name,group_message:group.messages});
 //            }
 //            else{
 //                res.send("The group is not exist.")
 //            }
 //        });
	// });
    //create new group and insert the user who requested 
    router.post('/create/group',function(req,res){
        var username = req.user.username;
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
                // just in case the req.user.username == null
    			User.findOne({'username':username},function(err,user){
					if(err){
						res.send(err);
					}
					if(user){
						newGroup.users.push(user);
                        user.groups.push(newGroup);
                        user.save(function(err){
                            if(err){
                                res.send(err);
                            }
                        });
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
    router.get('/join/group/:group_name',function(req,res){
    	
        Group.findOne({'name':req.params.group_name},function(err,group){
    		if(err){
                
    			res.send(err);
    		}
    		if(group){
    			User.findOne({'name':req.user.username},function(err,user){
    				if(err){
    					res.send(err);
    				}
    				if(user){
                        var idx = group.users.indexOf(user._id);
                        if(idx>=0)
                            res.send('User alreay in this group');
    					group.users.push(user);
                        user.groups.push(group);
                        user.save(function(err){
                            if(err){
                                res.send(err);
                            }
                        });
    					group.save(function(err){
    						if(err){
    							res.send(err);
    						}
                            res.redirect('/group/'+group.name);
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
    router.get('/group/:group_name',function(req,res){
        Group.findOne({'name':req.params.group_name},function(err,group){
            if(err){
                
                res.send(err);
            }
            if(group){
                User.findOne({'name':req.user.username},function(err,user){
                    if(err){
                        res.send(err);
                    }
                    if(user){
                        var idx = group.users.indexOf(user._id);
                        if(idx>=0)
                            res.render('chat',{user:user,group:group,message:group.messages});
                        else
                            res.send("User isn't exist in this group");
                    }
                    else{
                        res.send("User is not found.")
                    }
                });
            }
            else{
                res.send("Sorry. This group has been closed.");
    });
    // leave group
    router.get('/leave/group/:group_name',function(req,res){
    	Group.findOne({'name':req.params.group_name},function(err,group){
    		if(err){
    			res.send(err);
    		}
    		if(group){
    			User.findOne({'name':req.user.name},function(err,user){
    				if(err){
    					res.send(err);
    				}
    				if(user){
                        var idx = group.users.indexOf(user._id);
    					group.users.splice(idx,1);
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