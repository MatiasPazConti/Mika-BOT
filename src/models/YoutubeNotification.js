const { Schema, model } = require("mongoose");

const youtubeNotificationSchema = new Schema({
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
  youtubeChannelId: {
    type: String,
    required: true,
    unique: true,
  },
  latestVideoId: {
    type: String,
    required: false,
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

module.exports = model("YoutubeNotification", youtubeNotificationSchema);
