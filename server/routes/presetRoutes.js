const express = require("express");
const router = express.Router();
const cors = require("cors");
const { createPreset } = require("../controllers/presetControllers");

router.use(
  cors({
    credentials: true,
    origin: "http://localhost:5173",
  })
);

router.post("/new", createPreset);

module.exports = router;
