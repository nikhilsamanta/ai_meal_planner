const UserPreference = require("../models/UserPreference");

/**
 * Get user preferences
 * GET /api/preferences
 */
const getPreferences = async (req, res) => {
  try {
    let preferences = await UserPreference.findOne({ userId: req.user.id });

    if (!preferences) {
      // Return default preference settings if none stored yet
      return res.status(200).json({
        success: true,
        preferences: {
          userId: req.user.id,
          familySize: 1,
          cuisine: "Indian",
          diet: "Vegetarian",
          budgetMonthly: 5000,
          proteinGoal: "Moderate",
          dislikedFoods: [],
          allergies: [],
          mealRepetition: "Low",
        },
      });
    }

    return res.status(200).json({
      success: true,
      preferences,
    });
  } catch (error) {
    console.error("Error fetching preferences:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while retrieving user preferences.",
    });
  }
};

/**
 * Save / Update user preferences (upsert)
 * POST /api/preferences
 */
const savePreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      familySize,
      cuisine,
      diet,
      budgetMonthly,
      proteinGoal,
      dislikedFoods,
      allergies,
      mealRepetition,
    } = req.body;

    const updateData = {
      familySize,
      cuisine,
      diet,
      budgetMonthly,
      proteinGoal,
      dislikedFoods,
      allergies,
      mealRepetition,
    };

    // Remove undefined fields so defaults are preserved if omitted
    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key]
    );

    const preferences = await UserPreference.findOneAndUpdate(
      { userId },
      updateData,
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Preferences updated successfully",
      preferences,
    });
  } catch (error) {
    console.error("Error saving preferences:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to save user preferences.",
    });
  }
};

module.exports = {
  getPreferences,
  savePreferences,
};
