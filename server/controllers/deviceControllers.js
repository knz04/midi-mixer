const User = require("../models/user");
const Device = require("../models/device");

const createDevice = async (req, res) => {
  try {
    const { deviceName, macAdd, userId } = req.body;

    // validate required fields
    if (!deviceName) {
      return res.json({
        error: "Device name required.",
      });
    }

    // check if device name already exists
    const exist = await Device.findOne({ deviceName });
    if (exist) {
      return res.json({
        error:
          "This device name is already taken. Please choose a different name.",
      });
    }

    // create device in database
    const device = await Device.create({
      deviceName,
      macAdd,
      userId,
    });

    return res.json(device);
  } catch (error) {
    console.log(error);
  }
};

const getDevice = async (req, res) => {
  try {
    const devices = await Device.find({ userId: req.params.userId });
    res.status(200).json(devices);
  } catch (error) {
    console.log(error);
  }
};

const updateDevice = async (req, res) => {
  try {
    const { deviceName } = req.body;

    // check if device exists
    const id = req.params.id;
    const deviceExist = await Device.findById(id);
    if (!deviceExist) {
      return res.json({
        error: "Device not found.",
      });
    }

    // update device data
    const updatedDevice = await Device.findByIdAndUpdate(
      req.params.id,
      { deviceName },
      { new: true }
    );
    res.status(200).json(updatedDevice);
  } catch (error) {
    console.log(error);
  }
};

const deleteDevice = async (req, res) => {
  try {
    const device = await Device.findByIdAndDelete(req.params.id);
    res.status(200).json("Device deleted successfully");
  } catch (error) {
    console.log(error);
  }
};

const loadPreset = async (req, res) => {
  try {
    const { presetId } = req.body;

    // find device by ID
    const id = req.params.id;
    const deviceExist = await Device.findById(id);
    if (!deviceExist) {
      return res.json({
        error: "Device not found",
      });
    }

    // add preset to device
    const updatedDevice = await Device.findByIdAndUpdate(
      req.params.id,
      { presetId },
      { new: true }
    );
    res.status(200).json(updatedDevice);
  } catch (error) {}
};

const removePreset = async (req, res) => {
  try {
    const { presetId } = req.body;

    // find device by ID
    const id = req.params.id;
    const deviceExist = await Device.findById(id);
    if (!deviceExist) {
      return res.status(404).json({
        error: "Device not found",
      });
    }

    // Check if the current presetId matches
    if (deviceExist.presetId.toString() !== presetId) {
      return res.status(404).json({
        error: "Preset not found on this device",
      });
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

module.exports = {
  createDevice,
  getDevice,
  updateDevice,
  deleteDevice,
  loadPreset,
  removePreset,
};
