const User = require("../models/user");
const Device = require("../models/device");
const Preset = require("../models/preset");
const jwt = require("jsonwebtoken");
const mqtt = require("mqtt");

const mqttOptions = {
  host: "e0d1458af7764ee788c14d0501883ccb.s1.eu.hivemq.cloud",
  port: 8883,
  username: "Midi",
  password: "midimidi",
  protocol: "mqtts", // Secure MQTT
};

const client = mqtt.connect(mqttOptions);
let channels = [];
let midiMessage = [];

function convertChannelsToMidi(channels) {
  // Map through the channels to generate MIDI messages
  const midiMessages = channels.map((channelData) => {
    const { channel, component, value } = channelData;

    // Determine the node number based on the component type
    let nodePrefix;
    if (component === "rotary") {
      nodePrefix = 6; // Rotary components use '6'
    } else if (component === "fader") {
      nodePrefix = 8; // Fader components use '8'
    } else if (component === "button") {
      nodePrefix = 7; // Button components use '7'
    } else {
      throw new Error(`Unknown component type: ${component}`);
    }

    // Handle button value conversion (boolean to MIDI standard)
    let midiValue = value;
    if (component === "button") {
      midiValue = value === 0 ? 0 : 127; // 0 becomes 0, non-zero becomes 127
    }

    // Assemble the MIDI message
    const node = `${nodePrefix}0`; // Node number is the prefix followed by '0'
    const midiMessage = `C${channel}N${node}V${midiValue}`;

    return midiMessage;
  });

  // Join all MIDI messages into one string separated by a colon
  return ";" + midiMessages.join(";");
}

const topic = "midi/+/messages";
let outTopic = [];
const message = "test";

client.on("connect", () => {
  console.log("Ready to send.");
  client.subscribe(topic, (err) => {
    if (err) {
      console.error("Failed to subscribe:", err);
    } else {
      console.log(`Subscribed to topic (send): ${topic}/receive`);
    }
  });
});

client.on("message", (topic) => {
  console.log(topic);
  outTopic = topic + "/receive";
});

const createDevice = async (req, res) => {
  const { token } = req.cookies; // Extract token from cookies

  if (!token) {
    return res.status(401).json({ error: "No token provided." });
  }

  jwt.verify(token, process.env.JWT_SECRET, {}, async (err, user) => {
    if (err) {
      return res.status(401).json({ error: "Invalid token." });
    }

    const userId = user.id;
    const { deviceName, pairId } = req.body;

    try {
      // Validate required fields
      if (!deviceName) {
        return res.json({ error: "Device name required." });
      }

      // Check if device name already exists
      const exist = await Device.findOne({ deviceName });
      if (exist) {
        return res.json({
          error:
            "This device name is already taken. Please choose a different name.",
        });
      }

      // Create the device in the database
      const device = await Device.create({
        deviceName,
        pairId,
        userId,
      });

      // Update user's devices array
      await User.findByIdAndUpdate(userId, {
        $push: { devices: device._id },
      });

      return res.json(device);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "Server error" });
    }
  });
};

const getDevice = async (req, res) => {
  const { token } = req.cookies;

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, {}, async (err, user) => {
      if (err) {
        return res.status(401).json({ error: "Invalid token." });
      }

      const userId = user.id;

      try {
        // Fetch devices for the user
        const devices = await Device.find({ userId });
        res.json(devices);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to retrieve devices." });
      }
    });
  } else {
    res.status(401).json({ error: "No token provided." });
  }
};

const updateDevice = async (req, res) => {
  const { deviceName, pairId } = req.body; // Get fields from request body

  try {
    // Check if device exists
    const id = req.params.id;
    const deviceExist = await Device.findById(id);
    if (!deviceExist) {
      return res.status(404).json({ error: "Device not found." });
    }

    // Update device data
    const updatedDevice = await Device.findByIdAndUpdate(
      id,
      { deviceName, pairId },
      { new: true }
    );
    res.status(200).json(updatedDevice);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to update device." });
  }
};

const deleteDevice = async (req, res) => {
  const { token } = req.cookies; // Extract token from cookies

  if (!token) {
    return res.status(401).json({ error: "No token provided." });
  }

  jwt.verify(token, process.env.JWT_SECRET, {}, async (err, user) => {
    if (err) {
      return res.status(401).json({ error: "Invalid token." });
    }

    const userId = user.id;
    const deviceId = req.params.id;

    try {
      // Find the device by ID and check if it belongs to the user
      const device = await Device.findOne({ _id: deviceId, userId });
      if (!device) {
        return res.status(404).json({ error: "Device not found." });
      }

      // Delete the device
      await Device.findByIdAndDelete(deviceId);

      // Remove the device ID from the user's devices array
      await User.findByIdAndUpdate(userId, {
        $pull: { devices: deviceId },
      });

      res.status(200).json("Device deleted successfully");
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Failed to delete device." });
    }
  });
};

async function loadPreset(req, res) {
  const { presetId } = req.body; // Get fields from request body

  try {
    // Check if device exists
    const id = req.params.id;

    const presetInfo = await Preset.findById(presetId);
    if (!presetInfo) {
      return res.status(404).json({ error: "Preset not found." });
    }

    // Get channels from the preset
    channels = presetInfo.channels;
    console.log("Channels:", channels);

    // Convert channels to MIDI messages
    midiMessage = convertChannelsToMidi(channels);
    console.log("MIDI Message:", midiMessage);

    // Publish the MIDI message to the MQTT topic
    client.publish(outTopic, midiMessage, (err) => {
      if (err) {
        console.error("Failed to publish message:", err);
      } else {
        console.log(`Message published to topic: ${outTopic}`);
      }
    });

    // Update device with the selected presetId
    const updatedDevice = await Device.findByIdAndUpdate(
      id,
      { presetId },
      { new: true }
    );
    res.status(200).json(updatedDevice);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to update device." });
  }
}

const removePreset = async (req, res) => {
  try {
    const { presetId } = req.body;

    // Find device by ID
    const id = req.params.id;
    const deviceExist = await Device.findById(id);
    if (!deviceExist) {
      return res.status(404).json({ error: "Device not found." });
    }

    // Check if the current presetId matches
    if (deviceExist.presetId.toString() !== presetId) {
      return res
        .status(404)
        .json({ error: "Preset not found on this device." });
    }

    // Set the presetId to null
    deviceExist.presetId = null;

    // Save the updated device
    await deviceExist.save();

    return res.status(200).json({
      message: "Preset removed from device successfully",
      device: deviceExist,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const getDeviceId = async (req, res) => {
  try {
    const deviceId = req.params.id;
    const device = await Device.findById(deviceId);
    if (!device) {
      return res.status(404).json({ error: "Device not found." });
    }
    res.status(200).json(device);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error." });
  }
};

module.exports = {
  createDevice,
  getDevice,
  updateDevice,
  deleteDevice,
  loadPreset,
  removePreset,
  getDeviceId,
};
