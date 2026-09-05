const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const {
  getPrices,
  savePrices,
  deletePrice,
} = require("../controllers/priceController");

// All price routes are protected by authMiddleware
router.use(authMiddleware);

// GET /api/prices - Retrieve all ingredient prices for logged-in user
router.get("/", getPrices);

// POST /api/prices - Save or bulk upsert ingredient prices
router.post("/", savePrices);

// DELETE /api/prices/:id - Remove an ingredient price entry
router.delete("/:id", deletePrice);

module.exports = router;
