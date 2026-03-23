"use strict";
const router = require('express').Router();
const { sendRequest, getPending, respondToRequest, getFriends } = require('../controllers/friend.controller');
const { auth } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validator');
const { friendRequestSchema, respondSchema } = require('../middlewares/auth.validation');
// Send request
router.post('/request', auth, validate(friendRequestSchema), sendRequest);
// List pending
router.get('/pending', auth, getPending);
// List friends
router.get('/list', auth, getFriends);
// Respond
router.put('/respond/:senderId', auth, validate(respondSchema), respondToRequest);
module.exports = router;
