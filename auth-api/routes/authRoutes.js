const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  registerUser,
  loginUser,
  getProfile,
  verifyToken,
  getAllUsers,
  logoutUser
} = require("../controllers/authController");
console.log("authMiddleware =", authMiddleware);
console.log("logoutUser =", logoutUser);


const router = express.Router();




router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", authMiddleware, logoutUser);


router.get("/profile", authMiddleware, getProfile);
router.get("/verify", authMiddleware, verifyToken);
router.get("/users", getAllUsers);

module.exports = router;
