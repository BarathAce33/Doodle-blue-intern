import express from 'express';
import { signup, login, forgetPassword, resetPassword, updateProfile, changePassword } from '../controllers/auth.controller';
import validate from '../middlewares/validator';
import { signupSchema, loginSchema, forgetPasswordSchema, resetPasswordSchema, updateProfileSchema, changePasswordSchema } from '../middlewares/auth.validation';
import { auth } from '../middlewares/auth.middleware';

const router = express.Router();

// auth
router.post('/signup', validate(signupSchema), signup);
router.post('/login', validate(loginSchema), login);

// pass
router.post('/forget', validate(forgetPasswordSchema), forgetPassword);
router.post('/reset', validate(resetPasswordSchema), resetPassword);

// secure
router.put('/profile', auth, validate(updateProfileSchema), updateProfile);
router.put('/change-pass', auth, validate(changePasswordSchema), changePassword);

export default router;
