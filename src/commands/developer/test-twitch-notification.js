require("dotenv").config();
const { PermissionFlagsBits } = require("discord.js");
const TwitchNotification = require("../../models/TwitchNotification");
const axios = require("axios");

const getTwitchAccess = async () => {
  const tokenUrl = "https://id.twitch.tv/oauth2/token";
  const params = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: process.env.TWITCH_CLIENT_ID,
    client_secret: process.env.TWITCH_CLIENT_SECRET,
  });
  try {
    const response = await fetch(tokenUrl, {
      method: "POST",
      body: params,
    });
    const data = await response.json();
    if (data.access_token) {
      return data.access_token;
    } else {
      console.error("Hubo un error obteniendo el ACCESS_TOKEN:\n", error);
      return data;
    }
  } catch (error) {
    console.error("Hubo un error intentando obtener el ACCESS_TOKEN:\n", error);
  }
};

const isChannelOnline = async (channelId) => {
  const API_URL = `https://api.twitch.tv/helix/streams?user_login=${channelId}`;
  try {
    const ACCESS_TOKEN = await getTwitchAccess();
    const response = await axios.get(API_URL, {
      headers: {
        "Client-ID": process.env.TWITCH_CLIENT_ID,
        Authorization: `Bearer ${ACCESS_TOKEN}`,
      },
    });
    const { data } = response.data;
    return data.length !== 0;
  } catch (error) {
    console.error(
      "Twitch-Notifications: Hubo un error intentando acceder a la información del canal\n",
      error
    );
  }
};

module.exports = {
  name: "test-twitch-notification",
  description: "[DEV]: Fuerza el evento READY: twitchNotifications.",
  permissionsRequired: [PermissionFlagsBits.Administrator],
  botPermissions: [PermissionFlagsBits.SendMessages],

  callback: async (interaction, client) => {
    if (!interaction.inGuild()) {
      interaction.reply({
        content: "Lo siento, este comando solo puede usarse en servidores.",
        ephemeral: true,
      });
      return;
    }

    try {
      await interaction.deferReply();

      const guildIds = client.guilds.cache.map((guild) => guild.id);

      if (guildIds.length === 0) {
        console.error(
          "Twitch-Notifications: La función no se ha configurado para ningún servidor."
        );
        interaction.deleteReply();
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
          interaction.deleteReply();
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
            if (twitchNotification.online) {
              twitchNotification.online = false;
              twitchNotification.save();
            }
          } else if (!twitchNotification.online) {
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

            twitchNotification.online = true;
            twitchNotification.save();
          }
        }

        twitchNotifications.length = 0;
      }

      guildIds.length = 0;
      interaction.deleteReply();
    } catch (error) {
      console.error(
        "Hubo un error con el comando: /test-twitch-notification\n",
        error
      );
    }
  },
};
