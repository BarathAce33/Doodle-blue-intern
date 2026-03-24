import mongoose, { Schema } from 'mongoose';

// request
export interface IFriendRequest {
  _id: number;
  sender: number;
  receiver: number;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

const friendRequestSchema = new Schema({
  _id: { type: Number, required: true },
  sender: { type: Number, ref: 'User', required: true },
  receiver: { type: Number, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' }
}, { timestamps: true });

const FriendRequest = mongoose.model('FriendRequest', friendRequestSchema);

export default FriendRequest;
