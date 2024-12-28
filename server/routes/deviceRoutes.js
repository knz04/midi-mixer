const express = require("express");
const router = express.Router();
const cors = require("cors");
const {
  createDevice,
  getDevice,
  updateDevice,
  deleteDevice,
  loadPreset,
  // removePreset,
  getDeviceId,
} = require("../controllers/deviceControllers");

router.use(
  cors({
    credentials: true,
    origin: "https://knz04.github.io/midi-mixer",
  })
);

router.post("/new", createDevice);
router.get("/:userId", getDevice);
router.put("/:id", updateDevice);
router.delete("/:id", deleteDevice);
router.get("/get-device/:id", getDeviceId);

// preset management
router.put("/add-preset/:id", loadPreset);
// router.put("/remove-preset/:id", removePreset);

module.exports = router;
