const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
  name: String,
  email: {
    type: String,
    unique: true,
  },
  password: String,
  presets: [
    {
      type: Schema.Types.ObjectId,
      ref: "Preset", // Reference to the 'Preset' model
    },
  ],
});

const userModel = mongoose.model("User", userSchema);

module.exports = userModel;
