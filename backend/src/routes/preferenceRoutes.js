const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const {
  getPreferences,
  savePreferences,
} = require("../controllers/preferenceController");

// All preference routes require authentication
router.use(authMiddleware);

// GET /api/preferences - Fetch user preferences
router.get("/", getPreferences);

// POST /api/preferences - Create or update user preferences
router.post("/", savePreferences);

module.exports = router;
