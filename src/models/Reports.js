const { Schema, model } = require("mongoose");

const reportsSchema = new Schema({
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
  reportsEnabled: {
    type: Boolean,
    required: true,
    unique: true,
  },
  reportId: {
    type: Number,
    required: false,
    unique: true,
  },
});

module.exports = model("Reports", reportsSchema);
