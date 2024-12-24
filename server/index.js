const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv").config();
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const app = express();
const authRoutes = require("./routes/authRoutes");
const presetRoutes = require("./routes/presetRoutes");
const deviceRoutes = require("./routes/deviceRoutes");
// const mqtt = require("mqtt");
// const bodyParser = require("body-parser");

// const mqttOptions = {
//   host: "e0d1458af7764ee788c14d0501883ccb.s1.eu.hivemq.cloud",
//   port: 8883,
//   username: "Midi",
//   password: "midimidi",
//   protocol: "mqtts", // Secure MQTT
// };

// const client = mqtt.connect(mqttOptions);

// client.on("connect", () => {
//   console.log("Connected to MQTT broker");
//   const topic = "midi/+/messages"; // Subscribe to all topics under 'midi'
//   client.subscribe(topic, (err) => {
//     if (err) {
//       console.error("Failed to subscribe:", err);
//     } else {
//       console.log(`Subscribed to topic: ${topic}`);
//     }
//   });
// });

// client.on("message", (topic, message) => {
//   console.log(`Message received on topic ${topic}: ${message.toString()}`);

//   // Parse MIDI message (optional logic to handle data here)
//   const midiMessage = message.toString();
//   const channel = midiMessage.match(/C(\d+)/)?.[1];
//   const node = midiMessage.match(/N(\d+)/)?.[1];
//   const velocity = midiMessage.match(/V(\d+)/)?.[1];

//   console.log(
//     `Parsed MIDI Message: Channel=${channel}, Node=${node}, Velocity=${velocity}`
//   );
// });

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
    origin: "https://knz04.github.io/midi-mixer", // Your frontend URL
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
