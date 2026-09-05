const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const {
  suggestBasket,
  updateItemPrice,
} = require("../controllers/groceryFlowController");

// All grocery flow routes require authentication
router.use(authMiddleware);

// POST /api/groceries/suggest - Suggest initial raw grocery basket
router.post("/suggest", suggestBasket);

// PATCH /api/groceries/update-item-price - Update item price/quantity/pantry and recalculate total
router.patch("/update-item-price", updateItemPrice);

module.exports = router;
