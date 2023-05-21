const { Schema, model } = require("mongoose");

const reportSchema = new Schema({
  enabled: {
    type: Boolean,
    required: true,
    unique: true,
  },
  guildId: {
    type: String,
    required: true,
    unique: true,
  },
  notificationChannelId: {
    type: String,
    required: true,
    unique: true,
  },
  reportId: {
    type: Number,
    required: false,
    unique: true,
  },
});

module.exports = model("Report", reportSchema);
