const User = require("../models/user");
const { hashPassword, comparePassword } = require("../helpers/auth");
const jwt = require("jsonwebtoken");

const test = (req, res) => {
  res.json("test is working");
};

// Register endpoint
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    // Check if name was entered
    if (!name) {
      return res.json({
        error: "Name is required.",
      });
    }
    // Check password
    if (!password || password < 6) {
      return res.json({
        error: "Password is required and should be at least 6 characters.",
      });
    }
    // Check email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Simple email validation regex
    if (!email) {
      return res.json({
        error: "Email is required.",
      });
    } else if (!emailRegex.test(email)) {
      return res.json({
        error: "Please enter a valid email address.",
      });
    }

    // Check if email already exists
    const exist = await User.findOne({ email });
    if (exist) {
      return res.json({
        error: "Email is taken already.",
      });
    }

    const hashedPassword = await hashPassword(password);
    // Create user in database
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    return res.json(user);
  } catch (error) {
    console.log(error);
  }
};

// Login endpoint
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email is provided
    if (!email) {
      return res.json({
        error: "Email is required.",
      });
    }

    // Check if password is provided
    if (!password) {
      return res.json({
        error: "Password is required.",
      });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({
        error: "User does not exist.",
      });
    }

    // Check if passwords match
    const match = await comparePassword(password, user.password);
    if (match) {
      jwt.sign(
        { email: user.email, id: user._id, name: user.name },
        process.env.JWT_SECRET,
        {},
        (err, token) => {
          if (err) throw err;
          res.cookie("token", token).json(user);
        }
      );
    } else {
      return res.json({
        error: "Incorrect password.",
      });
    }
  } catch (error) {
    console.log(error);
  }
};

const getProfile = (req, res) => {
  const { token } = req.cookies;
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, {}, (err, user) => {
      if (err) throw err;
      res.json(user);
    });
  } else {
    res.json(null);
  }
};

const logoutUser = async (req, res) => {
  res.clearCookie("token");
  return res.json({ message: "Logged out successfully." });
};

module.exports = {
  test,
  registerUser,
  loginUser,
  getProfile,
  logoutUser,
};
