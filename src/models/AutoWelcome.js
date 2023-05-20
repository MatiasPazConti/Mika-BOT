const { Schema, model } = require("mongoose");

const autoWelcomeSchema = new Schema({
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
});

module.exports = model("AutoWelcome", autoWelcomeSchema);
