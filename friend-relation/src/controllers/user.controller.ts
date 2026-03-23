const User = require('../models/user.model');

// list
exports.getUsers = async (req: any, res: any, next: any) => {
  try {
    const currentUserId = req.user;

    const users = await User.find({ _id: { $ne: currentUserId } }).select('-password');

    const formatted = users.map((u: any) => ({
      userId: u._id,
      username: u.username,
      email: u.email
    }));

    res.status(200).json({
      status: 200,
      message: 'Users retrieved',
      data: formatted
    });
  } catch (err) {
    next(err);
  }
};

export {};
