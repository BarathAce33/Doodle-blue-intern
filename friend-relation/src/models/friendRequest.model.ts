const mongoose = require('mongoose');
const { Schema } = mongoose;

// request schema
const friendRequestSchema = new Schema({
  _id: { type: Number, required: true },
  sender: { type: Number, ref: 'User', required: true },
  receiver: { type: Number, ref: 'User', required: true },
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'rejected'], 
    default: 'pending' 
  }
}, { timestamps: true });

module.exports = mongoose.model('FriendRequest', friendRequestSchema);

export {};
