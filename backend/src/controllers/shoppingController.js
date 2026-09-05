const ShoppingList = require("../models/ShoppingList");
const MealPlan = require("../models/MealPlan");

/**
 * Get shopping list for the user's active meal plan
 * GET /api/shopping-list
 */
const getShoppingList = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find current active meal plan
    const activeMealPlan = await MealPlan.findOne({
      userId,
      status: "active",
    }).sort({ createdAt: -1 });

    if (!activeMealPlan) {
      return res.status(404).json({
        success: false,
        message: "No active meal plan found for shopping list generation.",
      });
    }

    // Find shopping list linked to active meal plan
    let shoppingList = await ShoppingList.findOne({
      userId,
      mealPlanId: activeMealPlan._id,
    });

    if (!shoppingList) {
      // Fallback: search for latest shopping list by user
      shoppingList = await ShoppingList.findOne({ userId }).sort({ createdAt: -1 });
    }

    if (!shoppingList) {
      return res.status(404).json({
        success: false,
        message: "No shopping list found.",
      });
    }

    return res.status(200).json({
      success: true,
      shoppingList,
    });
  } catch (error) {
    console.error("Error fetching shopping list:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while retrieving shopping list.",
    });
  }
};

/**
 * Toggle or update inPantry / purchased status of a single shopping list item
 * PATCH /api/shopping-list/item/:itemId
 */
const toggleItemStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;
    const { inPantry, purchased } = req.body;

    // Find user's shopping list
    let shoppingList = await ShoppingList.findOne({
      userId,
      $or: [{ "items._id": itemId }, { "items.name": itemId.toLowerCase() }],
    }).sort({ createdAt: -1 });

    if (!shoppingList) {
      shoppingList = await ShoppingList.findOne({ userId }).sort({ createdAt: -1 });
    }

    if (!shoppingList) {
      return res.status(404).json({
        success: false,
        message: "Shopping list not found.",
      });
    }

    // Find the item subdocument by id or name
    let item = shoppingList.items.id(itemId);
    if (!item) {
      item = shoppingList.items.find(
        (i) => i.name.toLowerCase() === decodeURIComponent(itemId).toLowerCase()
      );
    }

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found in shopping list.",
      });
    }

    // Update item properties if provided
    if (typeof inPantry === "boolean") {
      item.inPantry = inPantry;
    }
    if (typeof purchased === "boolean") {
      item.purchased = purchased;
    }

    await shoppingList.save();

    return res.status(200).json({
      success: true,
      message: "Item status updated successfully",
      item,
      shoppingList,
    });
  } catch (error) {
    console.error("Error updating shopping list item:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update shopping list item.",
    });
  }
};

/**
 * Reset all items in active shopping list (set purchased & inPantry to false)
 * POST /api/shopping-list/reset
 */
const resetShoppingList = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find current active meal plan
    const activeMealPlan = await MealPlan.findOne({
      userId,
      status: "active",
    });

    if (!activeMealPlan) {
      return res.status(404).json({
        success: false,
        message: "No active meal plan found.",
      });
    }

    const shoppingList = await ShoppingList.findOne({
      userId,
      mealPlanId: activeMealPlan._id,
    });

    if (!shoppingList) {
      return res.status(404).json({
        success: false,
        message: "No active shopping list found to reset.",
      });
    }

    // Reset flags for all items
    shoppingList.items.forEach((item) => {
      item.inPantry = false;
      item.purchased = false;
    });

    await shoppingList.save();

    return res.status(200).json({
      success: true,
      message: "Shopping list reset successfully",
      shoppingList,
    });
  } catch (error) {
    console.error("Error resetting shopping list:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to reset shopping list.",
    });
  }
};

module.exports = {
  getShoppingList,
  toggleItemStatus,
  resetShoppingList,
};
