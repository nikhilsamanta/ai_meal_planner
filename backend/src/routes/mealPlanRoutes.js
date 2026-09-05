const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const {
  getCurrentMealPlan,
  generatePlan,
} = require("../controllers/mealPlanController");

// All meal plan routes require authentication
router.use(authMiddleware);

// GET /api/meal-plan/current - Retrieve active meal plan
router.get("/current", getCurrentMealPlan);

// POST /api/meal-plan/generate - Generate a new AI 7-day meal plan & shopping list
router.post("/generate", generatePlan);

module.exports = router;
