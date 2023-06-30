require("dotenv").config();
const { PermissionFlagsBits } = require("discord.js");
const YoutubeNotification = require("../../models/YoutubeNotification");
const { google } = require("googleapis");
const Youtube = google.youtube("v3");

const getLatestVideoId = async (channelId) => {
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

module.exports = {
  name: "test-youtube-notification",
  description: "[DEV]: Fuerza el evento READY: youtubeNotifications.",
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
          "YouTube-Notifications: La función no se ha configurado para ningún servidor."
        );
        interaction.deleteReply();
        return;
      }

      for (const guildId of guildIds) {
        const youtubeNotifications = await YoutubeNotification.find({
          guildId: guildId,
        });

        if (youtubeNotifications.length === 0) {
          console.log(
            `YouTube-Notifications: La función no se ha configurado para el servidor ${guildId}`
          );
          interaction.deleteReply();
          return;
        }

        for (const youtubeNotification of youtubeNotifications) {
          const latestVideoId = await getLatestVideoId(
            youtubeNotification.youtubeChannelId
          );

          if (!youtubeNotification.latestVideoId) {
            console.log(
              `YouTube-Notifications: No se pudo obtener el ID del último video del canal ${youtubeNotification.youtubeChannelId}`
            );
            interaction.deleteReply();
            return;
          }

          if (youtubeNotification.latestVideoId !== latestVideoId) {
            let notificationMsg = "¡Nuevo video!";
            if (youtubeNotification.messageContent) {
              notificationMsg = youtubeNotification.messageContent;
            }

            if (youtubeNotification.tagRoleId) {
              notificationMsg = `<@&${youtubeNotification.tagRoleId}> ${notificationMsg}`;
            }

            notificationMsg = `${notificationMsg}\nhttps://www.youtube.com/watch?v=${latestVideoId}`;
            client.channels.cache
              .get(youtubeNotification.discordChannelId)
              .send(notificationMsg);

            youtubeNotification.latestVideoId = latestVideoId;
            await youtubeNotification.save();
          }
        }

        youtubeNotifications.length = 0;
      }

      guildIds.length = 0;
      interaction.deleteReply();
    } catch (error) {
      console.error(
        "Hubo un error con el comando: /test-youtube-notification\n",
        error
      );
    }
  },
};
