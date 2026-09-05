const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Protect routes - Authentication Middleware
 */
const authMiddleware = async (req, res, next) => {
  let token;

  // 1. Check for token in cookies
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  // 2. Or check for token in Authorization header (Bearer token)
  else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  // Check if token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access denied. No token provided.",
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database, excluding the password field
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Access denied. User not found.",
      });
    }

    // Attach user to the request object
    req.user = user;
    next();
  } catch (error) {
    console.error("Token verification error:", error.message);
    
    // Clear cookie if token verification fails (expired or invalid)
    if (req.cookies && req.cookies.token) {
      res.clearCookie("token");
    }

    return res.status(401).json({
      success: false,
      message: "Access denied. Invalid or expired token.",
    });
  }
};

module.exports = authMiddleware;
