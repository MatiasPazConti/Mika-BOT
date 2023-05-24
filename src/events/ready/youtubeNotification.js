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
    for (const guildId of guildIds) {
      const youtubeNotification = await YoutubeNotification.findOne({
        guildId: guildId,
      });

      if (!youtubeNotification) {
        console.log("YoutubeNotify: Este canal no se ha registrado.");
        return;
      }

      const channelInfo = await getChannelInfo(
        youtubeNotification.youtubeChannelId
      );

      if (
        !youtubeNotification.lastPostedVideoId ||
        channelInfo.latestVideoId !== youtubeNotification.latestVideoId
      ) {
        client.channels.cache
          .get(youtubeNotification.discordChannelId)
          .send(
            `**${channelInfo.channelName}** subió un nuevo video!\n` +
              `https://www.youtube.com/watch?v=${channelInfo.latestVideoId}`
          );

        youtubeNotification.latestVideoId = channelInfo.latestVideoId;
        await youtubeNotification.save();

        console.log("YoutubeNotify: Notificación exitosa!");
      } else {
        console.log(
          "YoutubeNotify: La notification ya se había realizado anteriormente."
        );
      }
    }

    guildIds.length = 0;
  }, 300000);
};
