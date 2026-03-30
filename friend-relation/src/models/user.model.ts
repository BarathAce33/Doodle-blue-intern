import { Schema, model, Types } from 'mongoose';

// user
const userSchema = new Schema({
  userId: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  friends: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  resetOTP: { type: String },
  resetOTPExpires: { type: Date }
}, { timestamps: true });

const User = model('User', userSchema);

export default User;
