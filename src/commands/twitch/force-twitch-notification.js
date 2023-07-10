const { PermissionFlagsBits } = require("discord.js");
const TwitchNotification = require("../../models/TwitchNotification");
const isTwitchChannelOnline = require("../../utils/isTwitchChannelOnline");

module.exports = {
  name: "force-twitch-notification",
  description: "Fuerza el evento READY: twitchNotifications.",
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

      const twitchNotifications = await TwitchNotification.find({
        guildId: interaction.guild.id,
      });

      if (twitchNotifications.length === 0) {
        console.log(
          `Twitch-Notifications: La función no se ha configurado para el servidor ${guildId}`
        );
        interaction.deleteReply();
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

      interaction.deleteReply();
    } catch (error) {
      console.error(
        "Hubo un error con el comando: /test-twitch-notification\n",
        error
      );
    }
  },
};
