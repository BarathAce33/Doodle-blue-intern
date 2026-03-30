"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsers = exports.getFriends = exports.respondToRequest = exports.getPending = exports.sendRequest = void 0;
const friendRequest_model_1 = __importDefault(require("../models/friendRequest.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const counter_model_1 = __importDefault(require("../models/counter.model"));
const mail_util_1 = require("../utils/mail.util");
// send
const sendRequest = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { receiverId } = req.body;
        const senderId = req.user;
        // self
        if (senderId === receiverId) {
            return res.status(400).json({ status: 400, message: 'Cannot send request to yourself' });
        }
        // exists
        const existing = yield friendRequest_model_1.default.findOne({
            $or: [
                { sender: senderId, receiver: receiverId },
                { sender: receiverId, receiver: senderId }
            ]
        });
        if (existing) {
            return res.status(400).json({ status: 400, message: 'Relationship or request already exists' });
        }
        // id
        const counter = yield counter_model_1.default.findOneAndUpdate({ id: 'request_id' }, { $inc: { seq: 1 } }, { new: true, upsert: true });
        if (!counter)
            throw new Error('No counter');
        // save
        yield friendRequest_model_1.default.create({
            _id: counter.seq,
            sender: senderId,
            receiver: receiverId
        });
        // mail
        const receiver = yield user_model_1.default.findById(receiverId);
        if (receiver) {
            const sender = yield user_model_1.default.findById(senderId);
            yield (0, mail_util_1.sendEmail)(receiver.email, 'New Friend Request', `User ${sender === null || sender === void 0 ? void 0 : sender.username} sent you a friend request.`);
        }
        return res.status(201).json({ status: 201, message: 'Friend request sent' });
    }
    catch (err) {
        next(err);
    }
});
exports.sendRequest = sendRequest;
// pending
const getPending = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user;
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        // find
        const requests = yield friendRequest_model_1.default.find({ receiver: userId, status: 'pending' })
            .populate('sender', 'username email')
            .skip(skip)
            .limit(limit);
        // count
        const total = yield friendRequest_model_1.default.countDocuments({ receiver: userId, status: 'pending' });
        // format
        const formatted = requests.map((r) => ({
            requestId: r._id,
            sender: {
                userId: r.sender._id,
                username: r.sender.username,
                email: r.sender.email
            },
            status: r.status,
            timestamp: r.createdAt
        }));
        return res.status(200).json({
            status: 200,
            message: 'Pending list retrieved',
            data: formatted,
            pagination: { total, page, limit, pages: Math.ceil(total / limit) }
        });
    }
    catch (err) {
        next(err);
    }
});
exports.getPending = getPending;
// respond
const respondToRequest = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status } = req.body;
        const senderId = Number(req.params.senderId);
        const userId = req.user;
        // find
        const request = yield friendRequest_model_1.default.findOne({
            sender: senderId,
            receiver: userId,
            status: 'pending'
        });
        if (!request) {
            return res.status(404).json({ status: 404, message: 'Request not found' });
        }
        // update
        request.status = status;
        yield request.save();
        // social
        if (status === 'accepted') {
            yield user_model_1.default.findByIdAndUpdate(request.sender, { $addToSet: { friends: request.receiver } });
            yield user_model_1.default.findByIdAndUpdate(request.receiver, { $addToSet: { friends: request.sender } });
        }
        return res.status(200).json({ status: 200, message: `Request ${status}` });
    }
    catch (err) {
        next(err);
    }
});
exports.respondToRequest = respondToRequest;
// friends
const getFriends = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user;
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        // find
        const user = yield user_model_1.default.findById(userId).populate({
            path: 'friends',
            select: 'username email',
            options: { skip, limit }
        });
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }
        // count
        const fullUser = yield user_model_1.default.findById(userId);
        const total = (fullUser === null || fullUser === void 0 ? void 0 : fullUser.friends.length) || 0;
        // list
        const formatted = user.friends.map((f) => ({
            userId: f._id,
            username: f.username,
            email: f.email
        }));
        return res.status(200).json({
            status: 200,
            message: 'Friend list retrieved',
            data: formatted,
            pagination: { total, page, limit, pages: Math.ceil(total / limit) }
        });
    }
    catch (err) {
        next(err);
    }
});
exports.getFriends = getFriends;
// users
const getUsers = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const currentUserId = req.user;
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        // find
        const users = yield user_model_1.default.find({ _id: { $ne: currentUserId } })
            .select('-password')
            .skip(skip)
            .limit(limit);
        // count
        const total = yield user_model_1.default.countDocuments({ _id: { $ne: currentUserId } });
        // format
        const formatted = users.map((u) => ({
            userId: u._id,
            username: u.username,
            email: u.email
        }));
        return res.status(200).json({
            status: 200,
            message: 'Users retrieved',
            data: formatted,
            pagination: { total, page, limit, pages: Math.ceil(total / limit) }
        });
    }
    catch (err) {
        next(err);
    }
});
exports.getUsers = getUsers;
