const { Schema, model } = require("mongoose");

const twitchNotificationSchema = new Schema({
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
  twitchChannelId: {
    type: String,
    required: true,
    unique: true,
  },
  tagRoleId: {
    type: String,
    required: false,
    unique: true,
  },
  messageContent: {
    type: String,
    required: false,
    unique: true,
  },
});

module.exports = model("TwitchNotification", twitchNotificationSchema);
