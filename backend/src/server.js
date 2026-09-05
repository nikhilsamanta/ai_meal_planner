require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");

// Initialize Express app
const app = express();

// Connect to Database
connectDB();

// Configure Middleware
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true, // Allow sharing of cookies across domains
  })
);
app.use(express.json()); // Body parser for JSON
app.use(cookieParser()); // Parse Cookies headers to populate req.cookies

// Base check endpoint
app.get("/", (req, res) => {
  res.json({ status: "healthy", message: "AI Meal Planner Auth Server is online" });
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

// New Meal Generation Routes
const mealRoutes = require("./routes/mealRoutes");
app.use("/api/meals", mealRoutes);


// Configure Port and listen
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
