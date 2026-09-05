const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const { generateMealsFromBasket } = require("../controllers/groceryFlowController");

// All meal generation routes require authentication
router.use(authMiddleware);

// POST /api/meals/generate-from-basket - Generate 7-day meal plan from confirmed priced basket
router.post("/generate-from-basket", generateMealsFromBasket);

module.exports = router;
