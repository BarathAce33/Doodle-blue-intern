"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const friend_controller_1 = require("../controllers/friend.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validator_1 = __importDefault(require("../middlewares/validator"));
const auth_validation_1 = require("../middlewares/auth.validation");
const router = (0, express_1.Router)();
// friends
router.post('/request', auth_middleware_1.auth, (0, validator_1.default)(auth_validation_1.friendRequestSchema), friend_controller_1.sendRequest);
router.get('/pending', auth_middleware_1.auth, friend_controller_1.getPending);
router.get('/list', auth_middleware_1.auth, friend_controller_1.getFriends);
router.put('/respond/:senderId', auth_middleware_1.auth, (0, validator_1.default)(auth_validation_1.respondSchema), friend_controller_1.respondToRequest);
exports.default = router;
