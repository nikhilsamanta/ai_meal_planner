const MealPlan = require("../models/MealPlan");
const UserPreference = require("../models/UserPreference");
const ShoppingList = require("../models/ShoppingList");
const IngredientPrice = require("../models/IngredientPrice");
const { generateMealPlanWithAI } = require("../services/aiService");

/**
 * Categorize ingredient into shopping list categories based on keywords
 */
const categorizeIngredient = (name = "") => {
  const lower = name.toLowerCase();

  if (
    /(apple|banana|tomato|onion|garlic|ginger|potato|spinach|carrot|lemon|lime|cilantro|coriander|capsicum|bell pepper|cucumber|lettuce|cabbage|cauliflower|broccoli|pea|veggie|vegetable|fruit|berry)/i.test(
      lower
    )
  ) {
    return "Produce";
  }
  if (/(milk|cheese|paneer|butter|ghee|curd|yogurt|cream|egg)/i.test(lower)) {
    return "Dairy & Eggs";
  }
  if (
    /(rice|dal|lentil|wheat|flour|atta|oat|quinoa|chana|rajma|chickpea|bread|roti|noodle|pasta|grain|pulse)/i.test(
      lower
    )
  ) {
    return "Grains & Pulses";
  }
  if (
    /(chicken|mutton|fish|prawn|shrimp|beef|pork|meat|salmon)/i.test(lower)
  ) {
    return "Meat & Seafood";
  }
  if (
    /(salt|pepper|turmeric|chili|chilli|cumin|coriander powder|garam masala|mustard|cardamom|clove|cinnamon|spice|sauce|vinegar)/i.test(
      lower
    )
  ) {
    return "Spices & Condiments";
  }
  if (
    /(oil|olive oil|mustard oil|coconut oil|sunflower oil|sugar|jaggery|honey)/i.test(
      lower
    )
  ) {
    return "Pantry & Oils";
  }
  if (/(bread|bun|croissant|pita|naan|bakery)/i.test(lower)) {
    return "Bakery";
  }

  return "Other";
};

/**
 * Calculate estimated cost for an item based on custom user prices or intelligent fallback defaults
 */
const calculateItemCost = (name, quantity, itemUnit, priceMap) => {
  const cleanName = name.toLowerCase();
  const matchedPrice = priceMap.get(cleanName);

  if (!matchedPrice) {
    let fallbackRate = 40; // Default ₹40 per unit
    if (/(paneer|chicken|meat|fish|cheese|almond|cashew|ghee)/i.test(cleanName)) {
      fallbackRate = 350;
    } else if (/(rice|dal|pulse|wheat|oil|butter|egg)/i.test(cleanName)) {
      fallbackRate = 120;
    } else if (/(milk|curd|yogurt|cream)/i.test(cleanName)) {
      fallbackRate = 60;
    }

    const u = (itemUnit || "").toLowerCase();
    if (u === "g" || u === "ml") {
      return Math.round((quantity / 1000) * fallbackRate * 100) / 100;
    }
    return Math.round(quantity * fallbackRate * 100) / 100;
  }

  const { pricePerUnit, unit: priceUnit } = matchedPrice;
  const iUnit = (itemUnit || "").toLowerCase();
  const pUnit = (priceUnit || "").toLowerCase();

  let cost = 0;
  if (iUnit === pUnit) {
    cost = quantity * pricePerUnit;
  } else if (iUnit === "g" && pUnit === "kg") {
    cost = (quantity / 1000) * pricePerUnit;
  } else if (iUnit === "kg" && pUnit === "g") {
    cost = quantity * 1000 * pricePerUnit;
  } else if (iUnit === "ml" && pUnit === "l") {
    cost = (quantity / 1000) * pricePerUnit;
  } else if (iUnit === "l" && pUnit === "ml") {
    cost = quantity * 1000 * pricePerUnit;
  } else if (iUnit === "pcs" && pUnit === "dozen") {
    cost = (quantity / 12) * pricePerUnit;
  } else {
    cost = quantity * pricePerUnit;
  }

  return Math.round(cost * 100) / 100;
};

/**
 * Get current active meal plan for the user
 * GET /api/meal-plan/current
 */
const getCurrentMealPlan = async (req, res) => {
  try {
    const mealPlan = await MealPlan.findOne({
      userId: req.user.id,
      status: "active",
    }).sort({ createdAt: -1 });

    if (!mealPlan) {
      return res.status(404).json({
        success: false,
        message: "No active meal plan found.",
      });
    }

    return res.status(200).json({
      success: true,
      mealPlan,
    });
  } catch (error) {
    console.error("Error fetching active meal plan:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while retrieving meal plan.",
    });
  }
};

/**
 * Generate a new 7-day meal plan with AI & construct its corresponding shopping list with price estimation
 * POST /api/meal-plan/generate
 */
const generatePlan = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Fetch user preferences from DB
    const preferences = await UserPreference.findOne({ userId });
    if (!preferences) {
      return res.status(400).json({
        success: false,
        message: "Please set and save your dietary preferences before generating a meal plan.",
      });
    }

    // 2. Fetch custom user ingredient prices
    const customPrices = await IngredientPrice.find({ userId });
    const priceMap = new Map();
    customPrices.forEach((p) => priceMap.set(p.name.toLowerCase(), p));

    // 3. Generate meal plan using AI service
    const aiResponse = await generateMealPlanWithAI(preferences, customPrices);
    const daysData = aiResponse.week || aiResponse.days || [];

    if (!daysData || daysData.length === 0) {
      return res.status(500).json({
        success: false,
        message: "AI service failed to produce a valid 7-day meal schedule.",
      });
    }

    // 4. Archive any existing active meal plans for this user
    await MealPlan.updateMany(
      { userId, status: "active" },
      { status: "archived" }
    );

    // 5. Save new active MealPlan document
    const newMealPlan = await MealPlan.create({
      userId,
      weekStartDate: new Date(),
      status: "active",
      days: daysData,
    });

    // 6. Aggregate ingredients for ShoppingList
    const ingredientMap = new Map();

    daysData.forEach((dayObj) => {
      ["breakfast", "lunch", "dinner"].forEach((mealType) => {
        const meal = dayObj[mealType];
        if (meal && Array.isArray(meal.ingredients)) {
          meal.ingredients.forEach((ing) => {
            if (!ing || !ing.name) return;

            const cleanName = ing.name.trim();
            const lowerName = cleanName.toLowerCase();
            const unit = (ing.unit || "pcs").trim();
            const lowerUnit = unit.toLowerCase();
            const amount = Number(ing.amount) || 1;

            const mapKey = `${lowerName}___${lowerUnit}`;

            if (ingredientMap.has(mapKey)) {
              const existing = ingredientMap.get(mapKey);
              existing.quantity += amount;
            } else {
              ingredientMap.set(mapKey, {
                name: cleanName,
                quantity: amount,
                unit: unit,
                category: categorizeIngredient(cleanName),
                inPantry: false,
                purchased: false,
              });
            }
          });
        }
      });
    });

    // 7. Calculate estimated cost per item and total cost
    let totalEstimatedCost = 0;
    const shoppingItems = Array.from(ingredientMap.values()).map((item) => {
      const estimatedCost = calculateItemCost(item.name, item.quantity, item.unit, priceMap);
      totalEstimatedCost += estimatedCost;
      return {
        ...item,
        estimatedCost,
      };
    });

    const weeklyBudget = Math.round((preferences.budgetMonthly || 5000) / 4);

    // 8. Create corresponding ShoppingList document
    const newShoppingList = await ShoppingList.create({
      userId,
      mealPlanId: newMealPlan._id,
      totalEstimatedCost: Math.round(totalEstimatedCost),
      weeklyBudget,
      items: shoppingItems,
    });

    return res.status(201).json({
      success: true,
      message: "New AI meal plan and shopping list generated successfully!",
      mealPlan: newMealPlan,
      shoppingList: newShoppingList,
    });
  } catch (error) {
    console.error("Error generating meal plan:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to generate meal plan.",
    });
  }
};

module.exports = {
  getCurrentMealPlan,
  generatePlan,
};
