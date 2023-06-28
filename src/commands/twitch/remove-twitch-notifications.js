const {
  PermissionFlagsBits,
  ApplicationCommandOptionType,
} = require("discord.js");
const TwitchNotification = require("../../models/TwitchNotification");

module.exports = {
  name: "remove-twitch-notifications",
  description:
    "Deshabilita las notificaciones de un canal que haya sido registrado previamente.",
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

  callback: async (client, interaction) => {
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

      let twitchNotification = await TwitchNotification.findOneAndRemove({
        guildId: interaction.guild.id,
        twitchChannelId: twitchId,
      });

      if (twitchNotification) {
        interaction.editReply({
          content:
            `Se han deshabilitado las notificaciones de Twitch de **${twitchId}**.\n` +
            "Para rehabilitarlo, use el comando ``/add-twitch-notifications``.",
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
        `Hubo un error con el comando: /remove-twitch-notifications\n${error}`
      );
    }
    return;
  },
};
