const mongoose = require("mongoose");

const shoppingListItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [0, "Quantity cannot be negative"],
    },
    unit: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: [
        "Produce",
        "Dairy & Eggs",
        "Grains & Pulses",
        "Meat & Seafood",
        "Spices & Condiments",
        "Bakery",
        "Pantry & Oils",
        "Other",
      ],
      default: "Other",
    },
    inPantry: {
      type: Boolean,
      default: false,
    },
    purchased: {
      type: Boolean,
      default: false,
    },
    estimatedCost: {
      type: Number,
      default: 0,
      min: 0,
    },
  }
);

const shoppingListSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    mealPlanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MealPlan",
      required: true,
      index: true,
    },
    totalEstimatedCost: {
      type: Number,
      default: 0,
      min: 0,
    },
    weeklyBudget: {
      type: Number,
      default: 0,
      min: 0,
    },
    items: [shoppingListItemSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ShoppingList", shoppingListSchema);
