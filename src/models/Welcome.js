const { Schema, model } = require("mongoose");

const welcomeSchema = new Schema({
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
  welcomeMessage: {
    type: String,
    required: false,
    unique: true,
  },
});

module.exports = model("Welcome", welcomeSchema);
