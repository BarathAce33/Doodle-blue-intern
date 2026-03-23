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
Object.defineProperty(exports, "__esModule", { value: true });
const FriendRequest = require('../models/friendRequest.model');
const User = require('../models/user.model');
const Counter = require('../models/counter.model');
// send
exports.sendRequest = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { receiverId } = req.body;
        const senderId = req.user;
        // self
        if (senderId === receiverId) {
            return res.status(400).json({ status: 400, message: 'Cannot request yourself' });
        }
        // check
        const existing = yield FriendRequest.findOne({
            $or: [
                { sender: senderId, receiver: receiverId },
                { sender: receiverId, receiver: senderId }
            ]
        });
        if (existing) {
            return res.status(400).json({ status: 400, message: 'Request already exists' });
        }
        // counter
        const counter = yield Counter.findOneAndUpdate({ id: 'request_id' }, { $inc: { seq: 1 } }, { new: true, upsert: true });
        // create
        yield FriendRequest.create({
            _id: counter.seq,
            sender: senderId,
            receiver: receiverId
        });
        res.status(201).json({
            status: 201,
            message: 'Friend request sent'
        });
    }
    catch (err) {
        next(err);
    }
});
// pending
exports.getPending = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user;
        const requests = yield FriendRequest.find({ receiver: userId, status: 'pending' })
            .populate('sender', 'username email');
        const formatted = requests.map((r) => ({
            requestId: r._id,
            senderUser: {
                userId: r.sender._id,
                username: r.sender.username,
                email: r.sender.email
            },
            status: r.status,
            timestamp: r.createdAt
        }));
        res.status(200).json({
            status: 200,
            message: 'Pending requests',
            data: formatted
        });
    }
    catch (err) {
        next(err);
    }
});
// respond
exports.respondToRequest = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status } = req.body;
        const senderId = req.params.senderId;
        const userId = req.user;
        const request = yield FriendRequest.findOne({
            sender: senderId,
            receiver: userId,
            status: 'pending'
        });
        if (!request) {
            return res.status(404).json({ status: 404, message: 'Request not found' });
        }
        request.status = status;
        yield request.save();
        if (status === 'accepted') {
            // both
            yield User.findByIdAndUpdate(request.sender, { $addToSet: { friends: request.receiver } });
            yield User.findByIdAndUpdate(request.receiver, { $addToSet: { friends: request.sender } });
        }
        res.status(200).json({
            status: 200,
            message: `Request ${status}`
        });
    }
    catch (err) {
        next(err);
    }
});
// list
exports.getFriends = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user;
        const user = yield User.findById(userId).populate('friends', 'username email');
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }
        const formatted = user.friends.map((f) => ({
            userId: f._id,
            username: f.username,
            email: f.email
        }));
        res.status(200).json({
            status: 200,
            message: 'Friend list',
            data: formatted
        });
    }
    catch (err) {
        next(err);
    }
});
