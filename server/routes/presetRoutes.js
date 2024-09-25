const express = require("express");
const router = express.Router();
const Preset = require("../models/presetModel");

// Get all presets
router.get("/api/presets", async (req, res) => {
  try {
    const presets = await Preset.find(); // Fetch presets from MongoDB
    res.json(presets); // Send presets back to frontend
  } catch (err) {
    res.status(500).send("Server error");
  }
});

// Save a new preset
router.post("/api/presets", async (req, res) => {
  try {
    const newPreset = new Preset(req.body); // Create a new preset from request body
    const savedPreset = await newPreset.save(); // Save to MongoDB
    res.json(savedPreset); // Return the saved preset
  } catch (err) {
    res.status(500).send("Error saving preset");
  }
});

module.exports = router;
