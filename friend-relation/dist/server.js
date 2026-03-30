"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = __importDefault(require("./config/db"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const friend_routes_1 = __importDefault(require("./routes/friend.routes"));
const encryption_middleware_1 = require("./middlewares/encryption.middleware");
const error_middleware_1 = __importDefault(require("./middlewares/error.middleware"));
// config
dotenv_1.default.config();
const app = (0, express_1.default)();
// middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(encryption_middleware_1.encryptionMiddleware);
// db
(0, db_1.default)();
// routes
app.get('/health', (req, res) => {
    res.status(200).json({ status: 200, message: 'Server is healthy' });
});
app.use('/api/auth', auth_routes_1.default);
app.use('/api/users', user_routes_1.default);
app.use('/api/friends', friend_routes_1.default);
// fallback
app.use((req, res) => {
    return res.status(404).json({ status: 404, message: 'Endpoint not found' });
});
// error
app.use(error_middleware_1.default);
// listen
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`port ${PORT}`));
