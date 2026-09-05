const mongoose = require("mongoose");

const groceryBasketItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      lowercase: true,
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
      enum: ["kg", "g", "L", "ml", "pcs", "dozen", "pack"],
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
    pricePerUnit: {
      type: Number,
      default: 0,
      min: [0, "Price per unit cannot be negative"],
    },
    totalItemCost: {
      type: Number,
      default: 0,
      min: [0, "Total item cost cannot be negative"],
    },
    inPantry: {
      type: Boolean,
      default: false,
    },
  }
);

const groceryBasketSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["draft", "confirmed"],
      default: "draft",
    },
    weeklyBudget: {
      type: Number,
      required: true,
      min: [0, "Weekly budget cannot be negative"],
    },
    totalCost: {
      type: Number,
      default: 0,
      min: [0, "Total cost cannot be negative"],
    },
    items: [groceryBasketItemSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("GroceryBasket", groceryBasketSchema);
