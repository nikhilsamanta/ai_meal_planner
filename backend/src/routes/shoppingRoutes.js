const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const {
  getShoppingList,
  toggleItemStatus,
  resetShoppingList,
} = require("../controllers/shoppingController");

// All shopping list routes require authentication
router.use(authMiddleware);

// GET /api/shopping-list - Fetch active shopping list
router.get("/", getShoppingList);

// PATCH /api/shopping-list/item/:itemId - Update item purchased/inPantry status
router.patch("/item/:itemId", toggleItemStatus);

// POST /api/shopping-list/reset - Reset all items in active shopping list
router.post("/reset", resetShoppingList);

module.exports = router;
