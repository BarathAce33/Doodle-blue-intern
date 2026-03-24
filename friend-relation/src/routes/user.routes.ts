import { Router } from 'express';
import { getUsers } from '../controllers/friend.controller';
import { auth } from '../middlewares/auth.middleware';

const router = Router();

// users
router.get('/', auth, getUsers);

export default router;
