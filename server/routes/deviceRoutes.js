const express = require("express");
const router = express.Router();
const cors = require("cors");
const {
  createDevice,
  getDevice,
  updateDevice,
  deleteDevice,
  loadPreset,
  removePreset,
} = require("../controllers/deviceControllers");

router.use(
  cors({
    credentials: true,
    origin: "http://localhost:5173",
  })
);

router.post("/new", createDevice);
router.get("/:userId", getDevice);
router.put("/:id", updateDevice);
router.delete("/:id", deleteDevice);

// preset management
router.put("/add-preset/:id", loadPreset);
router.put("/remove-preset/:id", removePreset);

module.exports = router;
