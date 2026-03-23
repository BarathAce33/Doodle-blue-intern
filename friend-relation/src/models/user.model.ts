const mongoose = require('mongoose');
const { Schema } = mongoose;

// user schema
const userSchema = new Schema({
  _id: { type: Number, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  friends: [{ type: Number, ref: 'User' }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);

export {};
