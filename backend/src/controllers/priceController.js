const IngredientPrice = require("../models/IngredientPrice");

/**
 * Get all ingredient prices saved by the logged-in user
 * GET /api/prices
 */
const getPrices = async (req, res) => {
  try {
    const prices = await IngredientPrice.find({ userId: req.user.id }).sort({ name: 1 });
    return res.status(200).json({
      success: true,
      prices,
    });
  } catch (error) {
    console.error("Error fetching ingredient prices:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve ingredient prices.",
    });
  }
};

/**
 * Save or bulk upsert ingredient prices
 * POST /api/prices
 */
const savePrices = async (req, res) => {
  try {
    const userId = req.user.id;
    const items = Array.isArray(req.body) ? req.body : [req.body];

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid ingredient price item(s).",
      });
    }

    const savedResults = [];

    for (const item of items) {
      const { name, pricePerUnit, unit } = item;
      if (!name || pricePerUnit === undefined || !unit) {
        continue;
      }

      const cleanName = name.trim().toLowerCase();
      const updated = await IngredientPrice.findOneAndUpdate(
        { userId, name: cleanName },
        {
          pricePerUnit: Number(pricePerUnit),
          unit: unit.trim().toLowerCase(),
        },
        {
          new: true,
          upsert: true,
          runValidators: true,
          setDefaultsOnInsert: true,
        }
      );
      savedResults.push(updated);
    }

    return res.status(200).json({
      success: true,
      message: `${savedResults.length} ingredient price(s) saved successfully.`,
      prices: savedResults,
    });
  } catch (error) {
    console.error("Error saving ingredient prices:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to save ingredient prices.",
    });
  }
};

/**
 * Delete a specific ingredient price document
 * DELETE /api/prices/:id
 */
const deletePrice = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const deleted = await IngredientPrice.findOneAndDelete({ _id: id, userId });
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Ingredient price record not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Ingredient price deleted successfully.",
      deletedId: id,
    });
  } catch (error) {
    console.error("Error deleting ingredient price:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete ingredient price.",
    });
  }
};

module.exports = {
  getPrices,
  savePrices,
  deletePrice,
};
