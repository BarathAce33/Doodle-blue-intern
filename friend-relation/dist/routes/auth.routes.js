"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const validator_1 = __importDefault(require("../middlewares/validator"));
const auth_validation_1 = require("../middlewares/auth.validation");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// auth
router.post('/signup', (0, validator_1.default)(auth_validation_1.signupSchema), auth_controller_1.signup);
router.post('/login', (0, validator_1.default)(auth_validation_1.loginSchema), auth_controller_1.login);
// pass
router.post('/forget', (0, validator_1.default)(auth_validation_1.forgetPasswordSchema), auth_controller_1.forgetPassword);
router.post('/reset', (0, validator_1.default)(auth_validation_1.resetPasswordSchema), auth_controller_1.resetPassword);
// secure
router.put('/profile', auth_middleware_1.auth, (0, validator_1.default)(auth_validation_1.updateProfileSchema), auth_controller_1.updateProfile);
router.put('/change-pass', auth_middleware_1.auth, (0, validator_1.default)(auth_validation_1.changePasswordSchema), auth_controller_1.changePassword);
exports.default = router;
