const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv").config();
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const app = express();
const authRoutes = require("./routes/authRoutes");
const presetRoutes = require("./routes/presetRoutes");
const deviceRoutes = require("./routes/deviceRoutes");
const mqtt = require("mqtt");
const bodyParser = require("body-parser");

const mqttOptions = {
  host: "e0d1458af7764ee788c14d0501883ccb.s1.eu.hivemq.cloud",
  port: 8883,
  username: "Midi",
  password: "midimidi",
  protocol: "mqtts", // Secure MQTT
};

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
    origin: "http://localhost:5173", // Your frontend URL
    credentials: true, // Allow cookies
  })
);

app.use("/", authRoutes);
app.use("/presets", presetRoutes);
app.use("/devices", deviceRoutes);

const PORT = process.env.PORT | 8000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
