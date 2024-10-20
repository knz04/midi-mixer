const Preset = require("../models/preset");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

const createPreset = async (req, res) => {
  const { token } = req.cookies; // Extract token from cookies

  if (token) {
    // Verify the token
    jwt.verify(token, process.env.JWT_SECRET, {}, async (err, user) => {
      if (err) {
        return res.status(401).json({ error: "Invalid token." });
      }

      // Extract userId from the token
      const userId = user.id;

      try {
        const { presetName, description, channels } = req.body;

        // Validate required fields
        if (!presetName || !channels || channels.length === 0) {
          return res.json({
            error: "Preset name and channels are required.",
          });
        }

        // Check if the preset name already exists
        const exist = await Preset.findOne({ presetName });
        if (exist) {
          return res.json({
            error:
              "This preset name is already taken. Please choose a different name.",
          });
        }

        // Create the preset in the database with the userId
        const preset = await Preset.create({
          presetName,
          description,
          userId, // Add userId here
          channels,
        });

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
    const preset = await Preset.findByIdAndDelete(req.params.id);
    // check if preset exists
    // const id = req.params.id;
    // const presetExist = await Preset.findById(id);
    // if (!presetExist) {
    //   return res.json({
    //     error: "Preset not found",
    //   });
    // }
    res.status(200).json("Preset deleted successfully");
  } catch (error) {
    console.log(error);
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
