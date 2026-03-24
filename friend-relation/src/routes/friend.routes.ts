import { Router } from 'express';
import { sendRequest, getPending, respondToRequest, getFriends } from '../controllers/friend.controller';
import { auth } from '../middlewares/auth.middleware';
import validate from '../middlewares/validator';
import { friendRequestSchema, respondSchema } from '../middlewares/auth.validation';

const router = Router();

// friends
router.post('/request', auth, validate(friendRequestSchema), sendRequest);
router.get('/pending', auth, getPending);
router.get('/list', auth, getFriends);
router.put('/respond/:senderId', auth, validate(respondSchema), respondToRequest);

export default router;
