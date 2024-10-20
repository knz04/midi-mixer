const User = require("../models/user");
const Device = require("../models/device");
const jwt = require("jsonwebtoken");

const createDevice = async (req, res) => {
  const { token } = req.cookies; // Extract token from cookies

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, {}, async (err, user) => {
      if (err) {
        return res.status(401).json({ error: "Invalid token." });
      }

      const userId = user.id;
      const { deviceName, macAdd } = req.body;

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

        // Create device in the database
        const device = await Device.create({
          deviceName,
          macAdd,
          userId,
        });

        return res.json(device);
      } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Server error" });
      }
    });
  } else {
    return res.status(401).json({ error: "No token provided." });
  }
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
  const { deviceName, macAdd } = req.body; // Get fields from request body

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
      { deviceName, macAdd },
      { new: true }
    );
    res.status(200).json(updatedDevice);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to update device." });
  }
};

const deleteDevice = async (req, res) => {
  try {
    const device = await Device.findByIdAndDelete(req.params.id);
    if (!device) {
      return res.status(404).json({ error: "Device not found." });
    }
    res.status(200).json("Device deleted successfully");
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to delete device." });
  }
};

async function loadPreset(req, res) {
  const { presetId } = req.body; // Get fields from request body

  try {
    // Check if device exists
    const id = req.params.id;

    // Update device data
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

//   const { presetId } = req.body; // Expecting presetId in the request body
//   const { deviceId } = req.params; // Get the deviceId from route parameters

//   console.log("Preset ID:", presetId);
//   console.log("Device ID:", deviceId);

//   // // Check if presetId is provided and is a valid ObjectId
//   // if (!presetId || !mongoose.Types.ObjectId.isValid(presetId)) {
//   //   return res.status(400).json({ message: "Invalid preset ID" });
//   // }

//   // if (!deviceId || !mongoose.Types.ObjectId.isValid(deviceId)) {
//   //   return res.status(400).json({ message: "Invalid device ID" });
//   // }

//   try {
//     // Convert presetId and deviceId to ObjectId
//     const objectIdPreset = mongoose.Types.ObjectId(presetId);
//     const objectIdDevice = mongoose.Types.ObjectId(deviceId);

//     // Find the preset by its ObjectId
//     const preset = await Preset.findById(objectIdPreset);
//     if (!preset) {
//       return res.status(404).json({ message: "Preset not found" });
//     }

//     // Find the device by its deviceId
//     const device = await Device.findById(objectIdDevice);
//     if (!device) {
//       return res.status(404).json({ message: "Device not found" });
//     }

//     // Update the device's presetId with the selected preset's ObjectId
//     device.presetId = objectIdPreset;

//     // Save the updated device document
//     await device.save();

//     // Send success response with the updated device
//     return res.json({
//       message: "Preset loaded into device successfully",
//       device,
//     });
//   } catch (error) {
//     // Log the error and send a 500 response if something goes wrong
//     console.error("Error loading preset into device:", error);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// }

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
