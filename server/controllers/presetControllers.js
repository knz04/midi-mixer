const Preset = require("../models/preset");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const mqtt = require("mqtt");
const bodyParser = require("body-parser");

const mqttOptions = {
  host: "e0d1458af7764ee788c14d0501883ccb.s1.eu.hivemq.cloud",
  port: 8883,
  username: "Midi",
  password: "midimidi",
  protocol: "mqtts", // Secure MQTT
};

const client = mqtt.connect(mqttOptions);

client.on("connect", () => {
  console.log("Ready to receive.");
  const topic = "midi/+/preset"; // Subscribe to all topics under 'midi'
  client.subscribe(topic, (err) => {
    if (err) {
      console.error("Failed to subscribe:", err);
    } else {
      console.log(`Subscribed to topic (receive): ${topic}`);
    }
  });
});

// Shared variable to store the latest parsed MIDI message(s)
let latestMidiMessages = [];

// MQTT Client: Parse MIDI messages and store them
client.on("message", (topic, message) => {
  console.log(`Message received on topic ${topic}: ${message.toString()}`);

  // Split the MIDI message string into individual messages by ";"
  const midiMessages = message
    .toString()
    .split(";")
    .filter((msg) => msg.length > 0);

  // Initialize an array to store the converted data
  const databaseFormatData = [];

  // Process each MIDI message
  midiMessages.forEach((midiMessage) => {
    const channelMatch = midiMessage.match(/C(\d+)/);
    const nodeMatch = midiMessage.match(/N(\d+)/);
    const velocityMatch = midiMessage.match(/V(\d+)/);

    if (!channelMatch || !nodeMatch || !velocityMatch) {
      console.error("Invalid MIDI message format");
      return;
    }

    const channel = parseInt(channelMatch[1], 10); // Extract channel as a number
    const node = nodeMatch[1]; // Extract node as a string
    const velocity = parseInt(velocityMatch[1], 10); // Extract velocity as a number

    // Determine the component type based on the node prefix
    let componentType = null;
    if (node.startsWith("6")) {
      componentType = "rotary";
    } else if (node.startsWith("8")) {
      componentType = "fader";
    } else if (node.startsWith("7")) {
      componentType = "button";
    } else {
      console.error("Unknown component type.");
      return;
    }

    // Convert the velocity for button components
    const value =
      componentType === "button" ? (velocity === 127 ? true : false) : velocity;

    // Add the parsed data to the array
    databaseFormatData.push({
      channel: parseInt(node[1], 10) - 1, // Convert the second digit of node to channel index (subtract 1)
      component: componentType,
      value,
    });
  });

  // Log the final converted data
  console.log("Converted to database format:", databaseFormatData);
});

// Create Preset: Use the stored MIDI message(s)
const createPreset = async (req, res) => {
  const { token } = req.cookies;

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, {}, async (err, user) => {
      if (err) {
        return res.status(401).json({ error: "Invalid token." });
      }

      const userId = user.id;

      try {
        const { presetName, description } = req.body;

        if (!presetName) {
          return res.json({ error: "Preset name is required." });
        }

        // Check if the preset name is unique
        const exist = await Preset.findOne({ presetName });
        if (exist) {
          return res.json({ error: "This preset name is already taken." });
        }

        // Check if MIDI messages are available
        if (!latestMidiMessages.length) {
          return res
            .status(400)
            .json({ error: "No MIDI messages available for preset creation." });
        }

        // Construct preset data for each MIDI message
        const channels = latestMidiMessages.map((msg) => ({
          channel: msg.channel,
          component: msg.component,
          value: msg.value,
        }));

        // Create the new preset
        const preset = await Preset.create({
          presetName,
          description,
          userId,
          channels,
        });

        // Update user's presets array
        await User.findByIdAndUpdate(userId, {
          $push: { presets: preset._id },
        });

        // Clear the stored MIDI messages after usage
        latestMidiMessages = [];

        return res.json(preset);
      } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Server error" });
      }
    });
  } else {
    return res.status(401).json({ error: "No token provided." });
  }
};

const getPreset = (req, res) => {
  const { token } = req.cookies;

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, {}, async (err, user) => {
      if (err) {
        return res.status(401).json({ error: "Invalid token." });
      }

      // user.id will give you the userId from the token
      const userId = user.id;

      try {
        // Fetch presets for the user
        const presets = await Preset.find({ userId });

        // Return the presets
        res.json(presets);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to retrieve presets." });
      }
    });
  } else {
    res.status(401).json({ error: "No token provided." });
  }
};

const updatePreset = async (req, res) => {
  try {
    const { presetName, description, channels } = req.body;

    // check if preset exists
    const id = req.params.id;
    const presetExist = await Preset.findById(id);
    if (!presetExist) {
      return res.json({
        error: "Preset not found",
      });
    }

    // update preset data
    const updatedPreset = await Preset.findByIdAndUpdate(
      req.params.id,
      { presetName, description, channels },
      { new: true }
    );
    res.status(200).json(updatedPreset);
  } catch (error) {
    console.log(error);
  }
};

const deletePreset = async (req, res) => {
  try {
    const presetId = req.params.id;

    // Find and delete the preset
    const preset = await Preset.findByIdAndDelete(presetId);
    if (!preset) {
      return res.status(404).json({ error: "Preset not found" });
    }

    // Remove the preset ID from the user's presets array
    await User.findByIdAndUpdate(preset.userId, {
      $pull: { presets: presetId },
    });

    res.status(200).json("Preset deleted successfully");
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Server error" });
  }
};

const getPresetId = async (req, res) => {
  const { token } = req.cookies;

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, {}, async (err, user) => {
      if (err) {
        return res.status(401).json({ error: "Invalid token." });
      }

      try {
        const presetId = req.params.id;
        // Fetch preset by ID
        const fetchedPreset = await Preset.findById(presetId); // Pass presetId directly

        // Check if the preset exists
        if (!fetchedPreset) {
          return res.status(404).json({ error: "Preset not found." });
        }

        res.json(fetchedPreset);
      } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Server error" }); // Return an error message
      }
    });
  } else {
    res.status(401).json({ error: "No token provided." });
  }
};

module.exports = {
  createPreset,
  getPreset,
  updatePreset,
  deletePreset,
  getPresetId,
};
