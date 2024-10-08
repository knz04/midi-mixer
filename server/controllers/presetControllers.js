const Preset = require(".../models/preset");
const User = require(".../models/user");

export const createPreset = async (req, res) => {
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

module.exports = {
  createPreset,
};
