import FriendRequest from '../models/friendRequest.model';
import User from '../models/user.model';
import { sendEmail } from '../utils/mail.util';

// send
export const sendRequest = async (req: any, res: any, next: any) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.user;

    // find receiver by userId
    const receiver = await User.findOne({ userId: receiverId });
    if (!receiver) return res.status(404).json({ status: 404, message: 'Receiver not found' });

    // self
    if (senderId === receiver._id) return res.status(400).json({ status: 400, message: 'Cannot send request to yourself' });

    // check
    const existing = await FriendRequest.findOne({
      $or: [
        { sender: senderId, receiver: receiver._id },
        { sender: receiver._id, receiver: senderId }
      ]
    });
    if (existing) return res.status(400).json({ status: 400, message: 'Already exists' });

    // save
    await FriendRequest.create({
      sender: senderId,
      receiver: receiver._id
    });

    // notify
    // The receiver object is already fetched above
    if (receiver) {
      const sender = await User.findById(senderId);
      await sendEmail(receiver.email, 'NEW FRIEND REQUEST! 🚀', `GREAT NEWS! ${sender?.username} just sent you a friend request on Friend Relation App.`);
    }

    return res.status(201).json({ status: 201, message: 'Request sent' });
  } catch (err) {
    next(err);
  }
};

// pending
export const getPending = async (req: any, res: any, next: any) => {
  try {
    const userId = req.user;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // find
    const requests = await FriendRequest.find({ receiver: userId, status: 'pending' })
      .populate('sender', 'userId username email')
      .skip(skip)
      .limit(limit);

    // total
    const total = await FriendRequest.countDocuments({ receiver: userId, status: 'pending' });

    // list
    const data = requests.map((r: any) => ({
      requestId: r._id,
      sender: {
        userId: r.sender.userId,
        username: r.sender.username,
        email: r.sender.email
      },
      status: r.status,
      timestamp: r.createdAt
    }));

    return res.status(200).json({
      status: 200,
      message: 'Pending list',
      data,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) }
    });
  } catch (err) {
    next(err);
  }
};

// respond
export const respondToRequest = async (req: any, res: any, next: any) => {
  try {
    const { status } = req.body;
    const senderId = req.params.senderId;
    const userId = req.user;

    // find
    const sender = await User.findOne({ userId: senderId });
    if (!sender) return res.status(404).json({ status: 404, message: 'Sender not found' });

    const request: any = await FriendRequest.findOne({ 
      sender: sender._id, 
      receiver: userId, 
      status: 'pending' 
    });
    if (!request) return res.status(404).json({ status: 404, message: 'Not found' });

    // save
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
export const getFriends = async (req: any, res: any, next: any) => {
  try {
    const userId = req.user;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // find
    const user = await User.findById(userId).populate({
      path: 'friends',
      select: 'userId username email',
      options: { skip, limit }
    });
    if (!user) return res.status(404).json({ status: 404, message: 'User not found' });

    // total
    const fullUser = await User.findById(userId);
    const total = fullUser?.friends.length || 0;

    // list
    const data = (user.friends as any[]).map((f: any) => ({
      userId: f.userId,
      username: f.username,
      email: f.email
    }));

    return res.status(200).json({
      status: 200,
      message: 'Friend list',
      data,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) }
    });
  } catch (err) {
    next(err);
  }
};

// users
export const getUsers = async (req: any, res: any, next: any) => {
  try {
    const currentUserId = req.user;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // find
    const users = await User.find({ _id: { $ne: currentUserId } })
      .select('-password')
      .skip(skip)
      .limit(limit);

    // total
    const total = await User.countDocuments({ _id: { $ne: currentUserId } });

    // list
    const data = users.map((u: any) => ({
      userId: u.userId,
      username: u.username,
      email: u.email
    }));

    return res.status(200).json({
      status: 200,
      message: 'Users list',
      data,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) }
    });
  } catch (err) {
    next(err);
  }
};
