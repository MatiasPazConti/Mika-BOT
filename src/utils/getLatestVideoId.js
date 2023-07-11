require("dotenv").config();
const { google } = require("googleapis");
const Youtube = google.youtube("v3");

module.exports = async (channelId) => {
  try {
    const response = await Youtube.search.list({
      key: process.env.YOUTUBE_TOKEN,
      part: "id",
      channelId: channelId,
      type: "video",
      order: "date",
      maxResults: 1,
    });

    return response.data.items[0].id.videoId;
  } catch (error) {
    console.log(
      "YouTube-Notifications: Hubo un error intentando acceder a la información del canal",
      error
    );
  }
};
