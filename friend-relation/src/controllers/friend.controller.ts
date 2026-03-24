import { Response, NextFunction } from 'express';
import FriendRequest from '../models/friendRequest.model';
import User from '../models/user.model';
import Counter from '../models/counter.model';
import { AuthRequest } from '../middlewares/auth.middleware';

// send
export const sendRequest = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.user;

    // self
    if (senderId === receiverId) {
      return res.status(400).json({ status: 400, message: 'Cannot send request to yourself' });
    }

    // exists
    const existing = await FriendRequest.findOne({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId }
      ]
    });

    if (existing) {
      return res.status(400).json({ status: 400, message: 'Relationship or request already exists' });
    }

    // id
    const counter = await Counter.findOneAndUpdate(
      { id: 'request_id' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    if (!counter) throw new Error('No counter');

    // save
    await FriendRequest.create({
      _id: counter.seq,
      sender: senderId,
      receiver: receiverId
    });

    return res.status(201).json({ status: 201, message: 'Friend request sent' });
  } catch (err) {
    next(err);
  }
};

// pending
export const getPending = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user;

    // find
    const requests = await FriendRequest.find({ receiver: userId, status: 'pending' })
      .populate('sender', 'username email');

    // format
    const formatted = requests.map((r: any) => ({
      requestId: r._id,
      sender: {
        userId: r.sender._id,
        username: r.sender.username,
        email: r.sender.email
      },
      status: r.status,
      timestamp: r.createdAt
    }));

    return res.status(200).json({
      status: 200,
      message: 'Pending list retrieved',
      data: formatted
    });
  } catch (err) {
    next(err);
  }
};

// respond
export const respondToRequest = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;
    const senderId = Number(req.params.senderId);
    const userId = req.user;

    // find
    const request = await FriendRequest.findOne({ 
      sender: senderId, 
      receiver: userId, 
      status: 'pending' 
    });
    
    if (!request) {
      return res.status(404).json({ status: 404, message: 'Request not found' });
    }

    // update
    request.status = status;
    await request.save();

    // social
    if (status === 'accepted') {
      await User.findByIdAndUpdate(request.sender, { $addToSet: { friends: request.receiver } });
      await User.findByIdAndUpdate(request.receiver, { $addToSet: { friends: request.sender } });
    }

    return res.status(200).json({ status: 200, message: `Request ${status}` });
  } catch (err) {
    next(err);
  }
};

// friends
export const getFriends = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user;

    // find
    const user = await User.findById(userId).populate('friends', 'username email');
    
    if (!user) {
      return res.status(404).json({ status: 404, message: 'User not found' });
    }

    // list
    const formatted = (user.friends as any[]).map((f: any) => ({
      userId: f._id,
      username: f.username,
      email: f.email
    }));

    return res.status(200).json({
      status: 200,
      message: 'Friend list retrieved',
      data: formatted
    });
  } catch (err) {
    next(err);
  }
};

// users
export const getUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const currentUserId = req.user;

    // find
    const users = await User.find({ _id: { $ne: currentUserId } }).select('-password');

    // format
    const formatted = users.map((u: any) => ({
      userId: u._id,
      username: u.username,
      email: u.email
    }));

    return res.status(200).json({
      status: 200,
      message: 'Users retrieved',
      data: formatted
    });
  } catch (err) {
    next(err);
  }
};
