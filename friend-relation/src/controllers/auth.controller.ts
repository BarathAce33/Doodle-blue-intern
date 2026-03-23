const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const Counter = require('../models/counter.model');

// signup
exports.signup = async (req: any, res: any, next: any) => {
  try {
    const { username, email, password } = req.body;

    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      return res.status(400).json({ status: 400, message: 'User already exists' });
    }

    // counter
    const counter = await Counter.findOneAndUpdate(
      { id: 'user_id' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const hashed = await bcrypt.hash(password, 10);
    const newUser = await User.create({ 
      _id: counter.seq,
      username, 
      email, 
      password: hashed 
    });

    res.status(201).json({ 
      status: 201, 
      message: 'User created successfully',
      data: { userId: newUser._id }
    });
  } catch (err) {
    next(err);
  }
};

// login
exports.login = async (req: any, res: any, next: any) => {
  try {
    const { email, password } = req.body;

    const user: any = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ status: 400, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ status: 400, message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });

    res.status(200).json({
      status: 200,
      message: 'Login success',
      data: { 
        userId: user._id,
        token 
      }
    });
  } catch (err) {
    next(err);
  }
};

export {};
