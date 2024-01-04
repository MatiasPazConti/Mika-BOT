const { Schema, model } = require("mongoose");

const youtubeNotificationSchema = new Schema({
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
  youtubeChannelId: {
    type: String,
    required: true,
    unique: true,
  },
  latestVideoId1: {
    type: String,
    required: false,
    unique: false,
  },
  latestVideoId2: {
    type: String,
    required: false,
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

module.exports = model("YoutubeNotification", youtubeNotificationSchema);
