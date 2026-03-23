"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const router = require('express').Router();
const { signup, login } = require('../controllers/auth.controller');
const validate = require('../middlewares/validator');
const { signupSchema, loginSchema } = require('../middlewares/auth.validation');
// Auth routes
router.post('/signup', validate(signupSchema), signup);
router.post('/login', validate(loginSchema), login);
module.exports = router;
