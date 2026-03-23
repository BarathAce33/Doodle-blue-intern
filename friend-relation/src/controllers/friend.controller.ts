const FriendRequest = require('../models/friendRequest.model');
const User = require('../models/user.model');
const Counter = require('../models/counter.model');

// send
exports.sendRequest = async (req: any, res: any, next: any) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.user;

    // self
    if (senderId === receiverId) {
      return res.status(400).json({ status: 400, message: 'Cannot request yourself' });
    }

    // check
    const existing = await FriendRequest.findOne({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId }
      ]
    });

    if (existing) {
      return res.status(400).json({ status: 400, message: 'Request already exists' });
    }

    // counter
    const counter = await Counter.findOneAndUpdate(
      { id: 'request_id' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    // create
    await FriendRequest.create({
      _id: counter.seq,
      sender: senderId,
      receiver: receiverId
    });

    res.status(201).json({
      status: 201,
      message: 'Friend request sent'
    });
  } catch (err) {
    next(err);
  }
};

// pending
exports.getPending = async (req: any, res: any, next: any) => {
  try {
    const userId = req.user;
    const requests = await FriendRequest.find({ receiver: userId, status: 'pending' })
      .populate('sender', 'username email');

    const formatted = requests.map((r: any) => ({
      requestId: r._id,
      senderUser: {
        userId: r.sender._id,
        username: r.sender.username,
        email: r.sender.email
      },
      status: r.status,
      timestamp: r.createdAt
    }));

    res.status(200).json({
      status: 200,
      message: 'Pending requests',
      data: formatted
    });
  } catch (err) {
    next(err);
  }
};

// respond
exports.respondToRequest = async (req: any, res: any, next: any) => {
  try {
    const { status } = req.body;
    const senderId = req.params.senderId;
    const userId = req.user;

    const request = await FriendRequest.findOne({ 
      sender: senderId, 
      receiver: userId, 
      status: 'pending' 
    });
    
    if (!request) {
      return res.status(404).json({ status: 404, message: 'Request not found' });
    }

    request.status = status;
    await request.save();

    if (status === 'accepted') {
      // both
      await User.findByIdAndUpdate(request.sender, { $addToSet: { friends: request.receiver } });
      await User.findByIdAndUpdate(request.receiver, { $addToSet: { friends: request.sender } });
    }

    res.status(200).json({
      status: 200,
      message: `Request ${status}`
    });
  } catch (err) {
    next(err);
  }
};

// list
exports.getFriends = async (req: any, res: any, next: any) => {
  try {
    const userId = req.user;
    const user = await User.findById(userId).populate('friends', 'username email');
    
    if (!user) {
      return res.status(404).json({ status: 404, message: 'User not found' });
    }

    const formatted = user.friends.map((f: any) => ({
      userId: f._id,
      username: f.username,
      email: f.email
    }));

    res.status(200).json({
      status: 200,
      message: 'Friend list',
      data: formatted
    });
  } catch (err) {
    next(err);
  }
};

export {};
