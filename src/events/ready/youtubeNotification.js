require("dotenv").config();
const YoutubeNotification = require("../../models/YoutubeNotification");
const { google } = require("googleapis");
const Youtube = google.youtube("v3");

const getChannelInfo = async (channelId) => {
  try {
    const res = await Youtube.search.list({
      key: process.env.YOUTUBE_TOKEN,
      part: "id, snippet",
      channelId: channelId,
      maxResults: 1,
      order: "date",
    });

    const latestVideoId = res.data.items[0].id.videoId;
    const channelName = res.data.items[0].snippet.channelTitle;

    return { channelName, latestVideoId };
  } catch (err) {
    console.error(
      `YoutubeNotify: Hubo un error intentando acceder a la información del canal:\n${err}`
    );
  }
};

module.exports = async (client, interaction) => {
  setInterval(async () => {
    const guildIds = client.guilds.cache.map((guild) => guild.id);

    if (guildIds.length === 0) {
      console.error(
        "YouTubeNotify: La función no se ha configurado para ningún servidor."
      );
      return;
    }

    for (const guildId of guildIds) {
      const youtubeNotification = await YoutubeNotification.findOne({
        guildId: guildId,
      });

      if (!youtubeNotification) {
        console.log(
          `YouTubeNotify: La función no se ha configurado para el servidor ${guildId}`
        );
        return;
      }

      const channelInfo = await getChannelInfo(
        youtubeNotification.youtubeChannelId
      );

      if (channelInfo.latestVideoId !== youtubeNotification.latestVideoId) {
        client.channels.cache
          .get(youtubeNotification.discordChannelId)
          .send(
            `**${channelInfo.channelName}** subió un nuevo video!` +
              `\nhttps://www.youtube.com/watch?v=${channelInfo.latestVideoId}`
          );

        youtubeNotification.latestVideoId = channelInfo.latestVideoId;
        await youtubeNotification.save();

        console.log("YouTubeNotify: Notificación exitosa!");
      } else {
        console.log(
          "YouTubeNotify: La notification ya se había realizado anteriormente."
        );
      }
    }

    guildIds.length = 0;
  }, 900000); //15 minutos = 900.000
};
