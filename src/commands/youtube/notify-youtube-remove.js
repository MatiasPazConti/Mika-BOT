const {
  PermissionFlagsBits,
  ApplicationCommandOptionType,
} = require("discord.js");
const YoutubeNotification = require("../../models/YoutubeNotification");

module.exports = {
  name: "notify-youtube-remove",
  description:
    "Elimina un canal de notificaciones que haya sido registrado previamente. [En desarrollo]",
  options: [
    {
      name: "id",
      description: "ID del canal de YouTube.",
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

    const youtubeId = interaction.options.get("id").value;

    try {
      await interaction.deferReply();

      let youtubeNotification = await YoutubeNotification.findOneAndRemove({
        guildId: interaction.guild.id,
        youtubeChannelId: youtubeId,
      });

      if (youtubeNotification) {
        interaction.editReply({
          content:
            `Se ha borrado el canal de Youtube **${youtubeId}** de la base de datos.\n` +
            "Para volver a registrarlo, use el comando **/notify-youtube-add**.",
          ephemeral: true,
        });
        return;
      }

      interaction.editReply({
        content:
          `Lo siento, el canal YouTube **${youtubeId}** no se encuentra registrado en mi base de datos.\n` +
          "Para registrarlo, use el comando **/notify-youtube-add**.",
        ephemeral: true,
      });
    } catch (error) {
      console.error(
        `Hubo un error con el comando: /notify-youtube-remove\n${error}`
      );
    }
    return;
  },
};
