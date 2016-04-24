// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');
var timestamps = require('mongoose-timestamp');

var connection = mongoose.createConnection("mongodb://localhost:27017/irisDB");
autoIncrement.initialize(connection);

// create a schema
var messageSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  text: { type: String, required: true }
}, { collection: "messages" });

messageSchema.plugin(autoIncrement.plugin, {
  model: 'Message',
  field: 'messageId'
});
messageSchema.plugin(timestamps);

// the schema is useless so far
// we need to create a model using it
var Message = mongoose.model('Message', messageSchema);

// make this available to our users in our Node applications
module.exports = Message;