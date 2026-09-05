const jwt = require("jsonwebtoken");

/**
 * Generate a JWT token for a user
 * @param {string} userId - The database ID of the user
 * @returns {string} Signed JWT token
 */
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

module.exports = {
  generateToken,
};
