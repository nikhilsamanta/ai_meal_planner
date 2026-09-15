const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();

// Configure Middleware
const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3001",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
      ) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Base check endpoint
app.get("/", (req, res) => {
  res.json({ status: "healthy", message: "AI Meal Planner Auth Server is online" });
});

// Dedicated healthcheck endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy", timestamp: new Date() });
});

// Auth Routes
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

// Preference Routes
const preferenceRoutes = require("./routes/preferenceRoutes");
app.use("/api/preferences", preferenceRoutes);

// Meal Plan Routes
const mealPlanRoutes = require("./routes/mealPlanRoutes");
app.use("/api/meal-plan", mealPlanRoutes);

// Shopping List Routes
const shoppingRoutes = require("./routes/shoppingRoutes");
app.use("/api/shopping-list", shoppingRoutes);

// Ingredient Price Routes
const priceRoutes = require("./routes/priceRoutes");
app.use("/api/prices", priceRoutes);

// Grocery Flow Routes
const groceryRoutes = require("./routes/groceryRoutes");
app.use("/api/groceries", groceryRoutes);

// Meal Generation Routes
const mealRoutes = require("./routes/mealRoutes");
app.use("/api/meals", mealRoutes);

module.exports = app;