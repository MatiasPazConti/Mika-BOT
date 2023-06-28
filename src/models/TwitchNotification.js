const { Schema, model } = require("mongoose");

const twitchNotificationSchema = new Schema({
  guildId: {
    type: String,
    required: true,
    unique: false,
  },
  discordChannelId: {
    type: String,
    required: true,
    unique: false,
  },
  twitchChannelId: {
    type: String,
    required: true,
    unique: true,
  },
  online: {
    type: Boolean,
    required: true,
    unique: false,
  },
  tagRoleId: {
    type: String,
    required: false,
    unique: false,
  },
  messageContent: {
    type: String,
    required: false,
    unique: false,
  },
});

module.exports = model("TwitchNotification", twitchNotificationSchema);
