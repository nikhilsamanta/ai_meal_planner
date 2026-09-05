const { GoogleGenAI, Type } = require("@google/genai");

// Helper to retrieve initialized GoogleGenAI instance
const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing in backend environment variables.");
  }
  return new GoogleGenAI({ apiKey });
};

// Schema for Phase 1: Array of { name, quantity, unit, category }
const groceryBasketResponseSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      name: {
        type: Type.STRING,
        description: "Name of ingredient",
      },
      quantity: {
        type: Type.NUMBER,
        description: "Numeric quantity",
      },
      unit: {
        type: Type.STRING,
        description: "Unit: 'kg', 'g', 'L', 'ml', 'pcs', 'dozen', or 'pack'",
      },
      category: {
        type: Type.STRING,
        description:
          "Category: 'Produce', 'Dairy & Eggs', 'Grains & Pulses', 'Meat & Seafood', 'Spices & Condiments', 'Bakery', 'Pantry & Oils', 'Other'",
      },
    },
    required: ["name", "quantity", "unit", "category"],
  },
};

// Schemas for Phase 4: 7-day meal plan
const ingredientSchema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING },
    amount: { type: Type.NUMBER },
    unit: { type: Type.STRING },
  },
  required: ["name", "amount", "unit"],
};

const mealItemSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    description: { type: Type.STRING },
    ingredients: {
      type: Type.ARRAY,
      items: ingredientSchema,
    },
  },
  required: ["title", "description", "ingredients"],
};

const dayPlanSchema = {
  type: Type.OBJECT,
  properties: {
    day: { type: Type.STRING },
    breakfast: mealItemSchema,
    lunch: mealItemSchema,
    dinner: mealItemSchema,
  },
  required: ["day", "breakfast", "lunch", "dinner"],
};

const mealPlanResponseSchema = {
  type: Type.OBJECT,
  properties: {
    week: {
      type: Type.ARRAY,
      items: dayPlanSchema,
    },
  },
  required: ["week"],
};

/**
 * Phase 1: Propose a 7-day raw grocery basket without prices based on user preferences.
 * @param {Object} preferences - User preferences (familySize, cuisine, diet, proteinGoal, dislikedFoods, allergies)
 * @returns {Promise<Array>} List of grocery items { name, quantity, unit, category }
 */
const suggestGroceryBasket = async (preferences = {}) => {
  try {
    const {
      familySize = 1,
      cuisine = "Indian",
      diet = "Vegetarian",
      proteinGoal = "Moderate",
      dislikedFoods = [],
      allergies = [],
    } = preferences;

    const dislikedText = dislikedFoods.length > 0 ? dislikedFoods.join(", ") : "None";
    const allergiesText = allergies.length > 0 ? allergies.join(", ") : "None";

    const systemInstruction = `You are a professional nutritionist. Recommend a sensible 7-day grocery basket of raw ingredients scaled strictly for a family size of ${familySize}, cuisine ${cuisine}, diet ${diet}, and protein target ${proteinGoal}. Strictly avoid: ${dislikedText}, ${allergiesText}. Do NOT include or assume any monetary prices. Standardize units: use 'kg' or 'g' for bulk vegetables/grains, 'L' or 'ml' for liquids, 'pcs' or 'dozen' for eggs/bread.`;

    const userPrompt = `Generate a 7-day weekly grocery basket of raw ingredients for family size ${familySize}. Cuisine: ${cuisine}, Diet: ${diet}, Protein Goal: ${proteinGoal}. Exclude dislikes: ${dislikedText}, Allergies: ${allergiesText}.`;

    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-3.6-flash",
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: groceryBasketResponseSchema,
      },
    });

    if (!response || !response.text) {
      throw new Error("No response text received from Gemini AI for grocery basket suggestion.");
    }

    const parsed = JSON.parse(response.text);
    const items = Array.isArray(parsed) ? parsed : parsed.items || parsed.groceryItems || [];

    if (!Array.isArray(items) || items.length === 0) {
      throw new Error("AI service returned an empty or invalid grocery basket list.");
    }

    const validUnits = ["kg", "g", "L", "ml", "pcs", "dozen", "pack"];
    const validCategories = [
      "Produce",
      "Dairy & Eggs",
      "Grains & Pulses",
      "Meat & Seafood",
      "Spices & Condiments",
      "Bakery",
      "Pantry & Oils",
      "Other",
    ];

    return items.map((item) => {
      let unit = (item.unit || "pcs").toLowerCase().trim();
      if (!validUnits.includes(unit)) {
        if (unit.includes("kilo") || unit === "kgs") unit = "kg";
        else if (unit.includes("liter") || unit.includes("litre") || unit === "l") unit = "L";
        else if (unit.includes("gram") || unit === "gm" || unit === "gms") unit = "g";
        else if (unit.includes("milli") || unit === "mls") unit = "ml";
        else if (unit.includes("doz")) unit = "dozen";
        else if (unit.includes("pkt") || unit.includes("pack") || unit.includes("bag")) unit = "pack";
        else unit = "pcs";
      }

      let category = item.category || "Other";
      if (!validCategories.includes(category)) {
        category = "Other";
      }

      return {
        name: (item.name || "Unknown").toLowerCase().trim(),
        quantity: Math.max(0.1, Number(item.quantity) || 1),
        unit,
        category,
      };
    });
  } catch (error) {
    console.error("Error in suggestGroceryBasket:", error);
    throw new Error(`Grocery Basket Suggestion Failed: ${error.message}`);
  }
};

/**
 * Phase 4: Generate a 7-day meal plan strictly restricted to the priced grocery basket ingredients.
 * @param {Object} preferences - User preferences
 * @param {Array} groceryItems - Confirmed grocery items array
 * @returns {Promise<Object>} Validated JSON meal plan object containing week array
 */
const generateMealsFromPricedBasket = async (preferences = {}, groceryItems = []) => {
  try {
    const {
      familySize = 1,
      cuisine = "Indian",
      diet = "Vegetarian",
      proteinGoal = "Moderate",
    } = preferences;

    const sanitizedBasket = groceryItems.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      category: item.category,
      inPantry: item.inPantry || false,
    }));

    const systemInstruction = `You are a meal planner. Create a 7-day meal plan (Breakfast, Lunch, Dinner for Monday through Sunday). CRITICAL RULE: You must design all 21 meals using ONLY the ingredients and portions available in this grocery list: ${JSON.stringify(
      sanitizedBasket
    )}. Do NOT introduce any unlisted ingredients.`;

    const userPrompt = `Create a 7-day meal plan (Monday through Sunday) for family size ${familySize}, cuisine ${cuisine}, diet ${diet}, protein ${proteinGoal} using strictly these ingredients: ${JSON.stringify(
      sanitizedBasket
    )}.`;

    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-3.6-flash",
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: mealPlanResponseSchema,
      },
    });

    if (!response || !response.text) {
      throw new Error("No content received from Gemini AI service when generating meals.");
    }

    const parsedData = JSON.parse(response.text);
    if (!parsedData.week || !Array.isArray(parsedData.week)) {
      throw new Error("Invalid response format: 'week' array is missing from AI response.");
    }

    return parsedData;
  } catch (error) {
    console.error("Error in generateMealsFromPricedBasket:", error);
    throw new Error(`Meal Generation From Basket Failed: ${error.message}`);
  }
};

/**
 * Backward compatibility wrapper for old meal plan generation calls
 */
const generateMealPlanWithAI = async (preferences = {}, customPrices = []) => {
  const basket = await suggestGroceryBasket(preferences);
  return generateMealsFromPricedBasket(preferences, basket);
};

module.exports = {
  suggestGroceryBasket,
  generateMealsFromPricedBasket,
  generateMealPlanWithAI,
};
