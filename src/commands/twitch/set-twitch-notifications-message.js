const {
  PermissionFlagsBits,
  ApplicationCommandOptionType,
} = require("discord.js");
const TwitchNotification = require("../../models/TwitchNotification");

module.exports = {
  name: "set-twitch-notifications-message",
  description: "Asigna un nuevo mensaje de notificación.",
  options: [
    {
      name: "id",
      description: "ID del canal de Twitch.",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: "mensaje",
      description: "Nuevo mensaje personalziado.",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
  permissionsRequired: [PermissionFlagsBits.Administrator],
  botPermissions: [PermissionFlagsBits.SendMessages],

  callback: async (client, interaction) => {
    if (!interaction.inGuild()) {
      interaction.reply({
        content: "Lo siento, este comando solo puede usarse en servidores.",
        ephemeral: true,
      });
      return;
    }

    const twitchId = interaction.options.get("id").value;
    const msgContent = interaction.options.get("mensaje").value;

    try {
      await interaction.deferReply();

      let twitchNotification = await TwitchNotification.findOne({
        guildId: interaction.guild.id,
        twitchChannelId: twitchId,
      });

      if (twitchNotification) {
        twitchNotification.messageContent = msgContent;
        await twitchNotification.save();

        interaction.editReply({
          content:
            `Se ha modificado exitosamente el mensaje de notifición de Twitch para **${twitchId}** como:\n` +
            `${msgContent}`,
          ephemeral: true,
        });
        return;
      }

      interaction.editReply({
        content:
          `Lo siento, el canal Twitch **${twitchId}** no se encuentra registrado en mi base de datos.\n` +
          "Para registrarlo, use el comando ``/add-twitch-notifications``.",
        ephemeral: true,
      });
    } catch (error) {
      console.error(
        `Hubo un error con el comando: /set-twitch-notifications-message\n${error}`
      );
    }
  },
};
