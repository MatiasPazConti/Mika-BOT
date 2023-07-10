const TwitchNotification = require("../../models/TwitchNotification");
const isTwitchChannelOnline = require("../../utils/isTwitchChannelOnline");

module.exports = async (client) => {
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
        const channelOnline = await isTwitchChannelOnline(
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
          return;
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
  }, 1200000); //20 minutos = 1.200.000
};
