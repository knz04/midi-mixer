const mongoose = require("mongoose");
const { Schema } = mongoose;

const presetSchema = new Schema({
  presetName: String,
  description: String,
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    require: true,
  },
  channels: [
    {
      channel: {
        type: Number,
        min: [1, "Channel number must be between 1 and 6"],
        max: [6, "Channel number must be between 1 and 6"],
      },
      component: String,
      value: {
        type: Number,
        min: [0, "Value must be between 0 and 127"],
        max: [127, "Value must be between 0 and 127"],
      },
    },
  ],
});

const presetModel = mongoose.model("Preset", presetSchema);

module.exports = presetModel;
