const Preset = require("../models/preset");
const User = require("../models/user");

const createPreset = async (req, res) => {
  try {
    const { presetName, description, channels } = req.body;
    const userId = req.user._id;

    // validate required fields
    if (!presetName || !channels || channels.length == 0) {
      return res.json({
        error: "Preset name and channels are required.",
      });
    }

    // check if preset name already exists
    const exist = await Preset.findOne({ presetName });
    if (exist) {
      return res.json({
        error:
          "This preset name is already taken. Please choose a different name.",
      });
    }

    // create preset in database
    const preset = await Preset.create({
      presetName,
      description,
      userId,
      channels,
    });

    return res.json(preset);
  } catch (error) {
    console.log(error);
  }
};

const getPreset = async (req, res) => {
  try {
    const presets = await Preset.find({ userId: req.params.userId });
    res.status(200).json(presets);
  } catch (error) {
    console.log(error);
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
    const preset = await Preset.findByIdAndDelete(req.params.id);
    // check if preset exists
    const id = req.params.id;
    const presetExist = await Preset.findById(id);
    if (!presetExist) {
      return res.json({
        error: "Preset not found",
      });
    }
    res.status(200).json("Preset deleted successfully");
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  createPreset,
  getPreset,
  updatePreset,
  deletePreset,
};
