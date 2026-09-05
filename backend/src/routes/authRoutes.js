const express = require("express");
const router = express.Router();
const { register, login, logout, getMe } = require("../controllers/authController");
const authMiddleware = require("../middleware/auth");

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

// Protected routes (require valid JWT token)
router.get("/me", authMiddleware, getMe);

module.exports = router;
