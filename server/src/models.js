const mongoose = require('mongoose');
const { Schema } = mongoose;

const messageSchema = new Schema({
  content: String,
  datetime: Date,
  sender: Schema.Types.ObjectId
})

const Message = mongoose.model('message', messageSchema);


const conversationSchema = new Schema({
  messages: [Schema.Types.ObjectId]
})

const Conversation = mongoose.model('conversation', conversationSchema); 

const userSchema = new Schema({
  username: {type: String, unique: true},
  email: String,
  password: String,
  conversations: [Schema.Types.ObjectId]
});

const User = mongoose.model('user', userSchema); 

module.exports = {
  User,
  Message,
  Conversation
};