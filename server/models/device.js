const mongoose = require("mongoose");
const { Schema } = mongoose;

const deviceSchema = new Schema({
  deviceName: {
    type: String,
    required: true, // Ensures the device name is always provided
  },
  pairId: {
    type: String,
    required: true, // Ensures the pairId is always provided
    unique: true, // Ensures each pairId is unique
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true, // Ensures the userId is always provided
  },
  presetId: {
    type: Schema.Types.ObjectId,
    ref: "Preset",
    default: null, // Allows presetId to be null by default
  },
});

// Ensure the schema gets compiled into a model
const deviceModel = mongoose.model("Device", deviceSchema);

module.exports = deviceModel;
