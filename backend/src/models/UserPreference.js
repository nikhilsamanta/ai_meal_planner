const mongoose = require("mongoose");

const userPreferenceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    familySize: {
      type: Number,
      required: true,
      min: [1, "Family size must be at least 1"],
      default: 1,
    },
    cuisine: {
      type: String,
      enum: [
        "Indian",
        "Mediterranean",
        "Mexican",
        "Italian",
        "Asian",
        "American",
        "Continental",
        "Other",
      ],
      default: "Indian",
    },
    diet: {
      type: String,
      enum: ["Vegetarian", "Non-Vegetarian", "Eggetarian", "Vegan"],
      default: "Vegetarian",
    },
    budgetMonthly: {
      type: Number,
      min: [0, "Budget cannot be negative"],
      default: 5000,
    },
    proteinGoal: {
      type: String,
      enum: ["Standard", "Moderate", "High"],
      default: "Moderate",
    },
    dislikedFoods: {
      type: [String],
      default: [],
    },
    allergies: {
      type: [String],
      default: [],
    },
    mealRepetition: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Low",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("UserPreference", userPreferenceSchema);
