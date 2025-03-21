const express = require("express");
const router = express.Router();
const cors = require("cors");
const {
  createPreset,
  getPreset,
  updatePreset,
  deletePreset,
  getPresetId,
} = require("../controllers/presetControllers");

router.post("/new", createPreset);
router.get("/:userId", getPreset);
router.put("/:id", updatePreset);
router.delete("/:id", deletePreset);
router.get("/get-preset/:id", getPresetId);

module.exports = router;
