require("dotenv").config();
const TwitchNotification = require("../../models/TwitchNotification");
const axios = require("axios");

const isChannelOnline = async (channelId) => {
  const API_URL = `https://api.twitch.tv/helix/streams?user_login=${channelId}`;
  try {
    const response = await axios.get(API_URL, {
      headers: {
        "Client-ID": process.env.TWITCH_CLIENT_ID,
        Authorization: process.env.TWITCH_ACCESS_TOKEN,
      },
    });
    const { data } = response.data;
    return data.length !== 0;
  } catch (error) {
    console.error(
      `Twitch-Notifications: Hubo un error intentando acceder a la información del canal:\n${error}`
    );
  }
};

module.exports = async (client, interaction) => {
  setInterval(async () => {
    const guildIds = client.guilds.cache.map((guild) => guild.id);

    if (guildIds.length === 0) {
      console.error(
        "Twitch-Notifications: La función no se ha configurado para ningún servidor."
      );
      return;
    }

    for (const guildId of guildIds) {
      const twitchNotifications = await TwitchNotification.find({
        guildId: guildId,
      });

      if (twitchNotifications.length === 0) {
        console.log(
          `Twitch-Notifications: La función no se ha configurado para el servidor ${guildId}`
        );
        return;
      }

      for (const twitchNotification of twitchNotifications) {
        const channelOnline = await isChannelOnline(
          twitchNotification.twitchChannelId
        );

        if (!channelOnline) {
          console.log(
            `Twitch-Notifications: El canal ${twitchNotification.twitchChannelId} se encuentra Offline`
          );
          return;
        }

        let notificationMsg = "¡Nuevo directo!";
        if (twitchNotification.messageContent) {
          notificationMsg = twitchNotification.messageContent;
        }

        if (twitchNotification.tagRoleId) {
          notificationMsg = `<@&${twitchNotification.tagRoleId}> ${notificationMsg}`;
        }

        notificationMsg = `${notificationMsg}\nhttps://www.twitch.tv/${twitchNotification.twitchChannelId}`;
        client.channels.cache
          .get(twitchNotification.discordChannelId)
          .send(notificationMsg);

        twitchNotification.latestVideoId = latestVideoId;
        await twitchNotification.save();
      }

      twitchNotifications.length = 0;
    }

    guildIds.length = 0;
  }, 1200000); //20 minutos = 1.200.000
};
