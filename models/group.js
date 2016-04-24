// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var timestamps = require('mongoose-timestamp');

// create a schema
var groupSchema = new Schema({
  name: { type: String, required: true, unique: true },
  users: [{ type: Schema.Types.ObjectId, ref: 'User', unique: true }],
  messages: [{ type: Schema.Types.ObjectId, ref: 'Message' }]
}, { collection: "groups" });

groupSchema.plugin(timestamps);

// the schema is useless so far
// we need to create a model using it
var Group = mongoose.model('Group', groupSchema);

// make this available to our users in our Node applications
module.exports = Group;