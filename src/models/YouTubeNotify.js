const { Schema, model } = require("mongoose");

const youtubeNotifySchema = new Schema({
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
  lastPostedVideoId: {
    type: String,
    unique: true,
  },
});

module.exports = model("YouTubeNotifications", youtubeNotifySchema);
