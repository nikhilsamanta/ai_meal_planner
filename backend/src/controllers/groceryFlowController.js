const GroceryBasket = require("../models/GroceryBasket");
const UserPreference = require("../models/UserPreference");
const IngredientPrice = require("../models/IngredientPrice");
const MealPlan = require("../models/MealPlan");
const ShoppingList = require("../models/ShoppingList");
const { suggestGroceryBasket, generateMealsFromPricedBasket } = require("../services/aiService");

/**
 * Calculate total cost for an item based on quantity, unit, price per unit, and pantry status.
 * Handles g-to-kg and ml-to-L unit conversions (since prices for g/ml are entered per kg/L).
 */
const calculateItemCost = (quantity, unit, pricePerUnit, inPantry) => {
  if (inPantry) return 0;
  const price = Number(pricePerUnit) || 0;
  const qty = Number(quantity) || 0;
  const u = (unit || "").toLowerCase().trim();

  let cost = 0;
  if (u === "g" || u === "ml") {
    cost = (qty / 1000) * price;
  } else {
    cost = qty * price;
  }

  return Math.round(cost * 100) / 100;
};

/**
 * Recalculate total cost for all items in a grocery basket.
 */
const computeBasketTotal = (items = []) => {
  const total = items.reduce((sum, item) => sum + (Number(item.totalItemCost) || 0), 0);
  return Math.round(total * 100) / 100;
};

/**
 * 1. Suggest Grocery Basket
 * POST /api/groceries/suggest
 */
const suggestBasket = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    // 1. Fetch user preferences
    const preferences = await UserPreference.findOne({ userId });
    if (!preferences) {
      return res.status(400).json({
        success: false,
        message: "Please set your dietary preferences in your profile before generating a grocery basket.",
      });
    }

    const weeklyBudget = Math.round((preferences.budgetMonthly || 5000) / 4);

    // 2. Call AI service to get suggested raw grocery basket
    const suggestedItems = await suggestGroceryBasket(preferences);

    // 3. Fetch user's saved IngredientPrice records
    const savedPrices = await IngredientPrice.find({ userId });
    const priceMap = new Map();
    savedPrices.forEach((p) => {
      priceMap.set(p.name.toLowerCase().trim(), p.pricePerUnit);
    });

    // 4. Build items list with saved prices and calculated item costs
    const processedItems = suggestedItems.map((item) => {
      const cleanName = item.name.toLowerCase().trim();
      const savedPrice = priceMap.get(cleanName) || 0;
      const totalItemCost = calculateItemCost(item.quantity, item.unit, savedPrice, false);

      return {
        name: cleanName,
        quantity: item.quantity,
        unit: item.unit,
        category: item.category,
        pricePerUnit: savedPrice,
        totalItemCost,
        inPantry: false,
      };
    });

    const totalCost = computeBasketTotal(processedItems);

    // 5. Save or update draft GroceryBasket document
    let basket = await GroceryBasket.findOne({ userId, status: "draft" });

    if (basket) {
      basket.weeklyBudget = weeklyBudget;
      basket.items = processedItems;
      basket.totalCost = totalCost;
      await basket.save();
    } else {
      basket = await GroceryBasket.create({
        userId,
        status: "draft",
        weeklyBudget,
        totalCost,
        items: processedItems,
      });
    }

    return res.status(200).json({
      success: true,
      basket,
      weeklyBudget,
    });
  } catch (error) {
    console.error("Error in suggestBasket controller:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to generate grocery basket recommendation.",
    });
  }
};

/**
 * 2. Update Item Price / Quantity / Pantry Status
 * PATCH /api/groceries/update-item-price
 */
const updateItemPrice = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { basketId, itemId, pricePerUnit, quantity, inPantry } = req.body;

    if (!basketId || !itemId) {
      return res.status(400).json({
        success: false,
        message: "basketId and itemId are required.",
      });
    }

    // Find active/draft basket for user
    const basket = await GroceryBasket.findOne({ _id: basketId, userId, status: "draft" });
    if (!basket) {
      return res.status(404).json({
        success: false,
        message: "Draft grocery basket not found or unauthorized.",
      });
    }

    // Find target item within basket
    const item = basket.items.id(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found in grocery basket.",
      });
    }

    // Update item properties if provided
    if (typeof pricePerUnit !== "undefined") {
      item.pricePerUnit = Math.max(0, Number(pricePerUnit) || 0);

      // Upsert to IngredientPrice collection for future reference
      await IngredientPrice.findOneAndUpdate(
        { userId, name: item.name },
        { pricePerUnit: item.pricePerUnit, unit: item.unit },
        { upsert: true, new: true, runValidators: true }
      );
    }

    if (typeof quantity !== "undefined") {
      item.quantity = Math.max(0.1, Number(quantity) || 0.1);
    }

    if (typeof inPantry !== "undefined") {
      item.inPantry = Boolean(inPantry);
    }

    // Recalculate line item cost
    item.totalItemCost = calculateItemCost(
      item.quantity,
      item.unit,
      item.pricePerUnit,
      item.inPantry
    );

    // Recalculate overall total cost
    basket.totalCost = computeBasketTotal(basket.items);
    await basket.save();

    return res.status(200).json({
      success: true,
      basket,
      totalCost: basket.totalCost,
    });
  } catch (error) {
    console.error("Error in updateItemPrice controller:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update item in basket.",
    });
  }
};

/**
 * 3. Generate 7-Day Meal Plan from Confirmed Priced Basket
 * POST /api/meals/generate-from-basket
 */
const generateMealsFromBasket = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { basketId } = req.body;

    if (!basketId) {
      return res.status(400).json({
        success: false,
        message: "basketId is required.",
      });
    }

    // 1. Validate basket existence & ownership
    const basket = await GroceryBasket.findOne({ _id: basketId, userId });
    if (!basket) {
      return res.status(404).json({
        success: false,
        message: "Grocery basket not found or unauthorized.",
      });
    }

    // 2. Budget constraint enforcement
    if (basket.totalCost > basket.weeklyBudget) {
      return res.status(400).json({
        success: false,
        message:
          "Total grocery cost exceeds weekly budget. Adjust quantities or swap items before generating meals.",
      });
    }

    // 3. Fetch preferences
    const preferences = await UserPreference.findOne({ userId });

    // 4. Generate 21 meals strictly using basket ingredients
    const aiResponse = await generateMealsFromPricedBasket(preferences, basket.items);
    const daysData = aiResponse.week || [];

    if (!daysData || daysData.length === 0) {
      return res.status(500).json({
        success: false,
        message: "AI service failed to compose a 7-day meal plan from the grocery basket.",
      });
    }

    // 5. Archive previous active MealPlan documents
    await MealPlan.updateMany({ userId, status: "active" }, { status: "archived" });

    // 6. Save new MealPlan document
    const newMealPlan = await MealPlan.create({
      userId,
      weekStartDate: new Date(),
      status: "active",
      days: daysData,
    });

    // 7. Convert confirmed GroceryBasket into official ShoppingList record
    const shoppingItems = basket.items.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      category: item.category,
      inPantry: item.inPantry,
      purchased: false,
      estimatedCost: item.totalItemCost,
    }));

    await ShoppingList.create({
      userId,
      mealPlanId: newMealPlan._id,
      totalEstimatedCost: basket.totalCost,
      weeklyBudget: basket.weeklyBudget,
      items: shoppingItems,
    });

    // 8. Update basket status to confirmed
    basket.status = "confirmed";
    await basket.save();

    return res.status(201).json({
      success: true,
      message: "7-Day meal plan generated successfully from your locked grocery budget!",
      mealPlan: newMealPlan,
    });
  } catch (error) {
    console.error("Error in generateMealsFromBasket controller:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to generate meal plan from grocery basket.",
    });
  }
};

module.exports = {
  suggestBasket,
  updateItemPrice,
  generateMealsFromBasket,
};
