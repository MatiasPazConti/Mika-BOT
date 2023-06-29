const { Schema, model } = require("mongoose");

const serverBoostSchema = new Schema({
  guildId: {
    type: String,
    required: true,
    unique: true,
  },
  discordChannelId: {
    type: String,
    required: true,
    unique: true,
  },
  thanksMessage: {
    type: String,
    required: false,
    unique: false,
  },
});

module.exports = model("ServerBoost", serverBoostSchema);
