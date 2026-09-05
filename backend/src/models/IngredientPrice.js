const mongoose = require("mongoose");

const ingredientPriceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    pricePerUnit: {
      type: Number,
      required: true,
      min: [0, "Price cannot be negative"],
    },
    unit: {
      type: String,
      required: true,
      enum: ["kg", "g", "L", "ml", "pcs", "dozen", "pack"],
      default: "kg",
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index ensuring one price record per ingredient per user
ingredientPriceSchema.index({ userId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("IngredientPrice", ingredientPriceSchema);
