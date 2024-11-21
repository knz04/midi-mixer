const jwt = require("jsonwebtoken");
const User = require("../models/user");

const requireAuth = async (req, res, next) => {
  try {
    // Get token from request headers
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        error: "Unauthorized access. No token provided.",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user by ID decoded from token, attach user data to the request
    const user = await User.findById(decoded._id);
    if (!user) {
      return res.status(401).json({
        error: "User not found.",
      });
    }

    // Attach user info to the request object
    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(500).json({ error: "Server error." });
  }
};

module.exports = requireAuth;
