import { Router } from 'express';
import { signup, login } from '../controllers/auth.controller';
import validate from '../middlewares/validator';
import { signupSchema, loginSchema } from '../middlewares/auth.validation';

const router = Router();

// auth
router.post('/signup', validate(signupSchema), signup);
router.post('/login', validate(loginSchema), login);

export default router;
