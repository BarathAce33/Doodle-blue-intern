import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.model';
import Counter from '../models/counter.model';
import { sendEmail } from '../utils/mail.util';

// signup
export const signup = async (req: any, res: any, next: any) => {
  try {
    const { username, email, password } = req.body;

    // check
    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) return res.status(400).json({ status: 400, message: 'User already exists' });

    // next userId
    const counter = await Counter.findOneAndUpdate(
      { id: 'user_id' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    const formattedUserId = `User${counter.seq.toString().padStart(3, '0')}`;
    
    // crypt
    const hashed = await bcrypt.hash(password, 10);
    await User.create({ 
      userId: formattedUserId,
      username, 
      email, 
      password: hashed 
    });

    return res.status(201).json({
      status: 201,
      message: 'User created'
    });
  } catch (err) {
    next(err);
  }
};

// login
export const login = async (req: any, res: any, next: any) => {
  try {
    const { email, password } = req.body;

    // find
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ status: 400, message: 'Invalid credentials' });

    // match
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ status: 400, message: 'Invalid credentials' });

    // token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });

    return res.status(200).json({
      status: 200,
      message: 'Login success',
      data: { userId: user.userId, token }
    });
  } catch (err) {
    next(err);
  }
};

// forget
export const forgetPassword = async (req: any, res: any, next: any) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ status: 404, message: 'User not found' });

    // otp
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetOTP = otp;
    user.resetOTPExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
    await user.save();

    // mail
    await sendEmail(email, 'SECURITY: Password Reset OTP', `Your OTP for FRIEND RELATION APP is: ${otp}. Do not share this with anyone.`);

    return res.status(200).json({ status: 200, message: 'OTP sent' });
  } catch (err) {
    next(err);
  }
};

// reset
export const resetPassword = async (req: any, res: any, next: any) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({
      email,
      resetOTP: otp,
      resetOTPExpires: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ status: 400, message: 'Invalid or expired OTP' });

    // save
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetOTP = undefined;
    user.resetOTPExpires = undefined;
    await user.save();

    return res.status(200).json({ status: 200, message: 'Password reset' });
  } catch (err) {
    next(err);
  }
};

// update
export const updateProfile = async (req: any, res: any, next: any) => {
  try {
    const { username, email } = req.body;
    const userId = req.user;

    // check
    if (email) {
      const existing = await User.findOne({ email, _id: { $ne: userId } });
      if (existing) return res.status(400).json({ status: 400, message: 'Email taken' });
    }

    // save
    await User.findByIdAndUpdate(userId, { username, email });

    return res.status(200).json({ status: 200, message: 'Profile updated' });
  } catch (err) {
    next(err);
  }
};

// change
export const changePassword = async (req: any, res: any, next: any) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ status: 404, message: 'User not found' });

    // match
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ status: 400, message: 'Old password wrong' });

    // save
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.status(200).json({ status: 200, message: 'Password changed' });
  } catch (err) {
    next(err);
  }
};
