const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv").config();
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const app = express();
const authRoutes = require("./routes/authRoutes");
const presetRoutes = require("./routes/presetRoutes");
const deviceRoutes = require("./routes/deviceRoutes");

// database connection
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("Database connected"))
  .catch((err) => console.log("Database not connected"));

// middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://www.sketchmidi.cc",
      "https://sketchmidi.vercel.app",
    ], // Your frontend URL
    credentials: true, // Allow cookies
  })
);

app.use("/", authRoutes);
app.use("/presets", presetRoutes);
app.use("/devices", deviceRoutes);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
