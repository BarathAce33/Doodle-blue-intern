import { Schema, model } from 'mongoose';

// user
export interface IUser {
  _id: number;
  username: string;
  email: string;
  password: string;
  friends: number[];
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema({
  _id: { type: Number, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  friends: [{ type: Number, ref: 'User' }]
}, { timestamps: true });

const User = model('User', userSchema);

export default User;
