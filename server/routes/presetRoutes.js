const express = require("express");
const router = express.Router();
const cors = require("cors");
const {
  createPreset,
  getPreset,
  updatePreset,
  deletePreset,
} = require("../controllers/presetControllers");

router.use(
  cors({
    credentials: true,
    origin: "http://localhost:5173",
  })
);

router.post("/new", createPreset);
router.get("/:userId", getPreset);
router.put("/:id", updatePreset);
router.delete("/:id", deletePreset);

module.exports = router;
