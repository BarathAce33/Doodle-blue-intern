import { Schema, model, Types } from 'mongoose';

// request
const requestSchema = new Schema({
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' }
}, { timestamps: true });

const FriendRequest = model('FriendRequest', requestSchema);

export default FriendRequest;
