import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.model';
import Counter from '../models/counter.model';

// signup
export const signup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, email, password } = req.body;
    setTimeout(() =>{
      console.log("Time");
    }, 500000);

    // existing
    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      return res.status(400).json({ status: 400, message: 'User already exists' });
    }

    // id
    const counter = await Counter.findOneAndUpdate(
      { id: 'user_id' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    if (!counter) throw new Error('No counter');

    // save
    const hashed = await bcrypt.hash(password, 10);
    const newUser = await User.create({ 
      _id: counter.seq,
      username, 
      email, 
      password: hashed 
    });

    return res.status(201).json({ 
      status: 201, 
      message: 'User created fully',
      data: { userId: newUser._id }
    });
  } catch (err) {
    next(err);
  }
};

// login
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    // find
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ status: 400, message: 'Invalid credentials' });
    }

    // Pass
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ status: 400, message: 'Invalid credentials' });
    }

    // token
    const token = jwt.sign(
      { id: user._id }, 
      process.env.JWT_SECRET || 'secret', 
      { expiresIn: '1d' }
    );

    return res.status(200).json({
      status: 200,
      message: 'Login done',
      data: { userId: user._id, token }
    });
  } catch (err) {
    next(err);
  }
};
