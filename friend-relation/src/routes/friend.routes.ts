import express from 'express';
import { sendRequest, getPending, respondToRequest, getFriends } from '../controllers/friend.controller';
import { auth } from '../middlewares/auth.middleware';
import validate from '../middlewares/validator';
import { friendRequestSchema, respondSchema, paginationSchema } from '../middlewares/auth.validation';

const router = express.Router();

// friends
router.post('/request', auth, validate(friendRequestSchema), sendRequest);
router.get('/pending', auth, validate(paginationSchema, 'query'), getPending);
router.get('/list', auth, validate(paginationSchema, 'query'), getFriends);
router.put('/respond/:senderId', auth, validate(respondSchema), respondToRequest);

export default router;
