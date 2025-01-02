const Preset = require("../models/preset");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

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
        const { presetName, description, channels } = req.body;

        if (!presetName) {
          return res.json({ error: "Preset name is required." });
        }

        // Check if the preset name is unique
        const exist = await Preset.findOne({ presetName, userId });
        if (exist) {
          return res.json({
            error:
              "This device name is already taken by another device for this user. Please choose a different name.",
          });
        }

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
  const { token } = req.cookies;

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, {}, async (err, user) => {
      if (err) {
        return res.status(401).json({ error: "Invalid token." });
      }
      const { presetName, description, channels } = req.body;
      try {
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
    });
  } else {
    res.status(401).json({ error: "No token provided." });
  }
};

const deletePreset = async (req, res) => {
  const { token } = req.cookies;

  if (!token) {
    return res.status(401).json({ error: "No token provided." });
  }

  jwt.verify(token, process.env.JWT_SECRET, {}, async (err, user) => {
    if (err) {
      return res.status(401).json({ error: "Invalid token." });
    }

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
  });
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
