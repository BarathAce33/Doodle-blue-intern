import express from 'express';
import { getUsers } from '../controllers/friend.controller';
import { auth } from '../middlewares/auth.middleware';
import validate from '../middlewares/validator';
import { paginationSchema } from '../middlewares/auth.validation';

const router = express.Router();

// users
router.get('/', auth, validate(paginationSchema, 'query'), getUsers);

export default router;
