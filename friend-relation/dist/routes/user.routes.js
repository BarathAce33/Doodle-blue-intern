"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const router = require('express').Router();
const { getUsers } = require('../controllers/user.controller');
const { auth } = require('../middlewares/auth.middleware');
// User list
router.get('/', auth, getUsers);
module.exports = router;
