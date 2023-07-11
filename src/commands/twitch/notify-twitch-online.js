const { PermissionFlagsBits } = require("discord.js");
const TwitchNotification = require("../../models/TwitchNotification");
const isTwitchChannelOnline = require("../../utils/isTwitchChannelOnline");

module.exports = {
  name: "notify-twitch-online",
  description: "Notifica que el canal está en linea",
  options: [
    {
      name: "id",
      description: "ID del canal de Twitch.",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
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

    const twitchId = interaction.options.get("id").value;

    try {
      await interaction.deferReply();

      const twitchNotification = await TwitchNotification.find({
        guildId: interaction.guild.id,
        twitchChannelId: twitchId,
      });

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

      interaction.deleteReply();
    } catch (error) {
      console.error(
        "Hubo un error con el comando: /test-twitch-notification\n",
        error
      );
    }
  },
};
