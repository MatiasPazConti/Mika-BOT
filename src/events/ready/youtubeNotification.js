const YoutubeNotification = require("../../models/YoutubeNotification");
const getLatestVideoId = require("../../utils/getLatestVideoId");

module.exports = async (client) => {
  setInterval(async () => {
    const guildIds = client.guilds.cache.map((guild) => guild.id);

    if (guildIds.length === 0) {
      console.error(
        "YouTube-Notifications: La función no se ha configurado para ningún servidor."
      );
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
          return;
        }

        if (youtubeNotification.latestVideoId === latestVideoId) {
          return;
        }

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

      youtubeNotifications.length = 0;
    }

    guildIds.length = 0;
  }, 1200000); //20 minutos = 1.200.000
};
