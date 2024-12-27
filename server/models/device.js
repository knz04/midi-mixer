const mongoose = require("mongoose");
const { Schema } = mongoose;

const deviceSchema = new Schema({
  deviceName: String,
  pairId: { type: String, unique: true },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  presetId: {
    type: Schema.Types.ObjectId,
    ref: "Preset",
  },
});

const deviceModel = mongoose.model("Device", deviceSchema);

module.exports = deviceModel;
